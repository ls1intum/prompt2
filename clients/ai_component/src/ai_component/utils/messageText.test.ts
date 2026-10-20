import { describe, expect, it } from 'vitest'
import { messageText } from './messageText'

describe('messageText', () => {
  it('returns string content as is', () => {
    expect(messageText('Hello')).toBe('Hello')
  })

  it('renders no content as empty', () => {
    expect(messageText(null)).toBe('')
  })

  it('joins text parts and marks other parts by type', () => {
    expect(
      messageText([
        { type: 'text', text: 'First' },
        { type: 'image_url' },
        { type: 'text', text: 'Second' },
      ]),
    ).toBe('First\n[image_url]\nSecond')
  })
})
