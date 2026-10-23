package encryption

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testKey = "ZTJlLWFpLXRlc3Qta2V5LW5vdC1hLXJlYWwtc2VjcmU="

func newTestBox(t *testing.T) *Box {
	t.Setenv("AI_ENCRYPTION_KEY", testKey)
	box, err := New()
	require.NoError(t, err)
	return box
}

func TestEncryptRoundTrip(t *testing.T) {
	box := newTestBox(t)
	callID := uuid.New()

	sealed, err := box.Encrypt(callID, Request, []byte("logos-key-1234"))
	require.NoError(t, err)
	assert.NotContains(t, string(sealed), "logos-key-1234")
	assert.Equal(t, keyVersion, sealed[0])

	opened, err := box.Decrypt(callID, Request, sealed)
	require.NoError(t, err)
	assert.Equal(t, "logos-key-1234", string(opened))
}

func TestDecryptRejectsTamperedCiphertext(t *testing.T) {
	box := newTestBox(t)
	callID := uuid.New()
	sealed, err := box.Encrypt(callID, Request, []byte("content"))
	require.NoError(t, err)
	sealed[len(sealed)-1] ^= 0xff

	_, err = box.Decrypt(callID, Request, sealed)
	assert.Error(t, err)
}

func TestDecryptRejectsContentOfAnotherCall(t *testing.T) {
	box := newTestBox(t)
	sealed, err := box.Encrypt(uuid.New(), Request, []byte("content"))
	require.NoError(t, err)

	_, err = box.Decrypt(uuid.New(), Request, sealed)
	assert.Error(t, err)
}

func TestDecryptRejectsTheOtherPurpose(t *testing.T) {
	box := newTestBox(t)
	callID := uuid.New()
	sealed, err := box.Encrypt(callID, Request, []byte("content"))
	require.NoError(t, err)

	_, err = box.Decrypt(callID, Response, sealed)
	assert.Error(t, err, "a request swapped into the response field must not decrypt")
}

func TestDecryptRejectsUnknownKeyVersion(t *testing.T) {
	box := newTestBox(t)
	callID := uuid.New()
	sealed, err := box.Encrypt(callID, Request, []byte("content"))
	require.NoError(t, err)
	sealed[0] = keyVersion + 1

	_, err = box.Decrypt(callID, Request, sealed)
	assert.ErrorIs(t, err, ErrUnknownKeyVersion)
}

func TestNewValidatesTheKey(t *testing.T) {
	t.Setenv("DEBUG", "false")

	t.Setenv("AI_ENCRYPTION_KEY", "")
	_, err := New()
	assert.ErrorIs(t, err, ErrEmptyKey)

	t.Setenv("AI_ENCRYPTION_KEY", placeholderKey)
	_, err = New()
	assert.ErrorIs(t, err, ErrPlaceholderKey)

	t.Setenv("DEBUG", "true")
	_, err = New()
	assert.NoError(t, err, "the placeholder is accepted in a debug deployment")

	t.Setenv("AI_ENCRYPTION_KEY", "c2hvcnQ=")
	_, err = New()
	assert.Error(t, err, "a key that is not 32 bytes long is refused")
}
