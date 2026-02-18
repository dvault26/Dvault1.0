import crypto from 'crypto'

function base64UrlEncode(buf: Buffer) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.randomBytes(32))
}

export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return base64UrlEncode(hash)
}
