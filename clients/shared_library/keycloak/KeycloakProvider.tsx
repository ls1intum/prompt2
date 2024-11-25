import React, { createContext, ReactNode, useState } from 'react'
import type Keycloak from 'keycloak-js'

interface KeycloakContextType {
  keycloakValue: Keycloak | undefined
  setKeycloakValue: (keycloak: Keycloak) => void
}

export const KeycloakContext = createContext<KeycloakContextType>({
  keycloakValue: undefined,
  setKeycloakValue: () => {},
})

export const KeycloakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keycloakValue, setKeycloakValue] = useState<Keycloak>()

  return (
    <KeycloakContext.Provider value={{ keycloakValue, setKeycloakValue }}>
      {children}
    </KeycloakContext.Provider>
  )
}
