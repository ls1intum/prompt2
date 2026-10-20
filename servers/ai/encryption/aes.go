package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"

	"github.com/google/uuid"
	promptSDK "github.com/prompt-edu/prompt-sdk"
)

var ErrEmptyKey = errors.New("AI_ENCRYPTION_KEY environment variable is not set")

var ErrShortCiphertext = errors.New("ciphertext too short")

var ErrPlaceholderKey = errors.New("AI_ENCRYPTION_KEY is still the placeholder from .env.template, which is public; generate one with: openssl rand -base64 32")

// Shipped in the public .env templates, so only accepted with DEBUG=true.
const placeholderKey = "bG9jYWwtYWkta2V5LW5vdC1hLXJlYWwtc2VjcmV0ISE="

func getKey() ([]byte, error) {
	raw := promptSDK.GetEnv("AI_ENCRYPTION_KEY", "")
	if raw == "" {
		return nil, ErrEmptyKey
	}
	if raw == placeholderKey && promptSDK.GetEnv("DEBUG", "false") != "true" {
		return nil, ErrPlaceholderKey
	}
	key, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return nil, err
	}
	if len(key) != 32 {
		return nil, errors.New("AI_ENCRYPTION_KEY must decode to exactly 32 bytes")
	}
	return key, nil
}

// keyVersion leads every ciphertext, so a rotated key can be told apart from this one.
const keyVersion byte = 1

var ErrUnknownKeyVersion = errors.New("ciphertext was sealed with an unknown key version")

type Box struct {
	aead cipher.AEAD
}

func New() (*Box, error) {
	key, err := getKey()
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return &Box{aead: aead}, nil
}

// Purpose tells a call's request and response apart, so the two cannot be swapped.
type Purpose string

const (
	Request  Purpose = "request"
	Response Purpose = "response"
)

func additionalData(callID uuid.UUID, purpose Purpose) []byte {
	return append(callID[:], purpose...)
}

// Encrypt binds the ciphertext to its call and purpose, so content moved to another call or field does not decrypt.
func (b *Box) Encrypt(callID uuid.UUID, purpose Purpose, plaintext []byte) ([]byte, error) {
	nonce := make([]byte, b.aead.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}
	sealed := append([]byte{keyVersion}, nonce...)
	return b.aead.Seal(sealed, nonce, plaintext, additionalData(callID, purpose)), nil
}

func (b *Box) Decrypt(callID uuid.UUID, purpose Purpose, data []byte) ([]byte, error) {
	nonceEnd := 1 + b.aead.NonceSize()
	if len(data) < nonceEnd {
		return nil, ErrShortCiphertext
	}
	if data[0] != keyVersion {
		return nil, ErrUnknownKeyVersion
	}
	return b.aead.Open(nil, data[1:nonceEnd], data[nonceEnd:], additionalData(callID, purpose))
}
