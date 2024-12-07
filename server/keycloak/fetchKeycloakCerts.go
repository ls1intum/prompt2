package keycloak

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
)

// fetchKeycloakCerts fetches Keycloak public keys from the realm's JWKS endpoint.
func fetchKeycloakCerts() (map[string]*rsa.PublicKey, error) {
	// Construct the JWKS URL
	jwksURL := fmt.Sprintf("%s/realms/%s/protocol/openid-connect/certs", KeycloakSingleton.BaseURL, KeycloakSingleton.Realm)

	// Fetch the JWKS response
	resp, err := http.Get(jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	// Decode the JWKS response
	var jwks struct {
		Keys []struct {
			Kid string `json:"kid"`
			N   string `json:"n"`
			E   string `json:"e"`
		} `json:"keys"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS response: %w", err)
	}

	// Parse public keys from the JWKS response
	publicKeys, err := parseJWKSKeys(jwks.Keys)
	if err != nil {
		return nil, err
	}

	if len(publicKeys) == 0 {
		return nil, fmt.Errorf("no public keys found in JWKS")
	}

	return publicKeys, nil
}

// parseJWKSKeys parses the keys from a JWKS response into a map of RSA public keys.
func parseJWKSKeys(keys []struct {
	Kid string `json:"kid"`
	N   string `json:"n"`
	E   string `json:"e"`
}) (map[string]*rsa.PublicKey, error) {
	publicKeys := make(map[string]*rsa.PublicKey)

	for _, key := range keys {
		pubKey, err := parseRSAKey(key.N, key.E)
		if err != nil {
			return nil, fmt.Errorf("failed to parse key (kid: %s): %w", key.Kid, err)
		}
		publicKeys[key.Kid] = pubKey
	}

	return publicKeys, nil
}

// parseRSAKey converts the modulus (N) and exponent (E) into an RSA public key.
func parseRSAKey(modulusBase64, exponentBase64 string) (*rsa.PublicKey, error) {
	// Decode the modulus
	nBytes, err := base64.RawURLEncoding.DecodeString(modulusBase64)
	if err != nil {
		return nil, fmt.Errorf("invalid modulus: %w", err)
	}

	// Decode the exponent
	eBytes, err := base64.RawURLEncoding.DecodeString(exponentBase64)
	if err != nil {
		return nil, fmt.Errorf("invalid exponent: %w", err)
	}

	// Convert exponent bytes to an integer
	e := 0
	for _, b := range eBytes {
		e = e<<8 + int(b)
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: e,
	}, nil
}
