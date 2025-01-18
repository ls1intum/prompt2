import { sha256 } from 'js-sha256'

export const getGravatarUrl = (email) => {
  const hash = sha256(email.trim().toLowerCase())

  return `https://www.gravatar.com/avatar/${hash}?d=identicon&d=404`
}
