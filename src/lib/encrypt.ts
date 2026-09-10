// AES-256-GCM encryption for storing API keys / tokens at rest.
// Falls back to plaintext if ENCRYPTION_KEY is not set (dev/test only).

const ALG = "AES-GCM"
const KEY_HEX_LEN = 64 // 32 bytes

async function getKey(): Promise<CryptoKey | null> {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== KEY_HEX_LEN) return null
  const raw = Buffer.from(hex, "hex")
  return crypto.subtle.importKey("raw", raw, ALG, false, ["encrypt", "decrypt"])
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey()
  if (!key) return plaintext // no-op without ENCRYPTION_KEY

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const cipher = await crypto.subtle.encrypt({ name: ALG, iv }, key, encoded)

  const buf = Buffer.concat([Buffer.from(iv), Buffer.from(cipher)])
  return buf.toString("base64")
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getKey()
  if (!key) return ciphertext // no-op without ENCRYPTION_KEY

  const buf = Buffer.from(ciphertext, "base64")
  const iv = buf.subarray(0, 12)
  const data = buf.subarray(12)
  const plain = await crypto.subtle.decrypt({ name: ALG, iv }, key, data)
  return new TextDecoder().decode(plain)
}
