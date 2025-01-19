import { sha256 } from 'js-sha256'

export const getGravatarUrl = (email: string, size?: number) => {
  const requestedSize = size ?? 200
  const hash = sha256(email.trim().toLowerCase())

  return `https://www.gravatar.com/avatar/${hash}?d=identicon&d=404&size=${requestedSize}`
}
