import { MockSigner } from '../lib/mockSigner'

describe('MockSigner', () => {
  test('generate key pair and sign xrp', async () => {
    const s = new MockSigner()
    await s.initialize()
    const pub = await s.generateKeyPair('XRP')
    expect(pub).toBeDefined()
    const unsigned = { type: 'XRP_Payment', source: 'A', destination: 'B', amount: 1 }
    const signed = await s.sign('XRP', JSON.stringify(unsigned))
    expect(signed).toBeTruthy()
  })

  test('encrypt/decrypt blob', async () => {
    const s = new MockSigner()
    await s.initialize()
    const data = new TextEncoder().encode('hello')
    const enc = await s.encryptBlob(data)
    expect(enc).not.toEqual(data)
    const dec = await s.decryptBlob(enc)
    expect(new TextDecoder().decode(dec)).toBe('hello')
  })
})
