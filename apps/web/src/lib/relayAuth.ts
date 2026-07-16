/**
 * Relay authentication key (D2).
 *
 * A dedicated Ed25519 keypair used only to PROVE ownership of a relay `userId`
 * via challenge-response, so the relay's `hello { userId }` stops being an
 * unverified claim (closing the impersonation hole).
 *
 * The key is derived DETERMINISTICALLY from the recovery mnemonic, so it is
 * portable exactly like the Gossip identity: unlock with your passphrase on any
 * device and you reproduce the same key, matching the relay's pinned record. It
 * is intentionally SEPARATE from Gossip's post-quantum identity keys — the relay
 * is plain Node and can't verify PQ signatures — but derived from the same
 * secret, so there is nothing extra for the user to manage.
 *
 * Pure WebCrypto (Ed25519): no dependency, and the browser never exposes the
 * private key to app code beyond this module. Requires a modern engine
 * (Chromium 137+/Electron, Safari 17+, Firefox 130+); on anything older the
 * derivation throws and the client simply stays on the legacy unauthenticated
 * path until enforcement lands.
 */

const DOMAIN = "gossip-relay-auth:v1\n";
// DER wrappers for raw Ed25519 keys.
const PKCS8_PREFIX = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

const subtle = globalThis.crypto?.subtle;

function b64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function fromB64Url(s: string): Uint8Array {
  const b64s = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64s.padEnd(Math.ceil(b64s.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

interface AuthKey {
  mnemonic: string;
  publicKeyB64: string;
  privateKey: CryptoKey;
}

// Cached derived key for the open session. Cleared on sign-out.
let current: AuthKey | null = null;
let deriving: Promise<AuthKey | null> | null = null;

async function derive(mnemonic: string): Promise<AuthKey> {
  if (!subtle) throw new Error("WebCrypto unavailable");
  const seed = new Uint8Array(await subtle.digest("SHA-256", new TextEncoder().encode(DOMAIN + mnemonic.trim())));
  const pkcs8 = new Uint8Array(PKCS8_PREFIX.length + seed.length);
  pkcs8.set(PKCS8_PREFIX);
  pkcs8.set(seed, PKCS8_PREFIX.length);
  const privateKey = await subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, true, ["sign"]);
  // The public key rides in the private key's JWK export (`x`), deterministic.
  const jwk = await subtle.exportKey("jwk", privateKey);
  const publicKeyB64 = b64(fromB64Url(jwk.x as string));
  return { mnemonic, publicKeyB64, privateKey };
}

/**
 * Derive (once, memoized) the relay-auth key for this mnemonic and return its
 * base64 public key. Safe to call repeatedly; returns null if the environment
 * can't do Ed25519 (the caller then stays on the legacy path).
 */
export async function ensureAuthKey(mnemonic: string): Promise<string | null> {
  if (!mnemonic) return null;
  if (current?.mnemonic === mnemonic) return current.publicKeyB64;
  if (!deriving) {
    deriving = derive(mnemonic)
      .then((k) => {
        current = k;
        return k;
      })
      .catch((e) => {
        console.warn("relay-auth key derivation unavailable:", e instanceof Error ? e.message : e);
        return null;
      })
      .finally(() => {
        deriving = null;
      });
  }
  const k = await deriving;
  return k?.publicKeyB64 ?? null;
}

/** The cached public key if already derived, else null (sync, for hello). */
export function authPublicKeySync(): string | null {
  return current?.publicKeyB64 ?? null;
}

/** Sign a server challenge message. Returns base64 signature, or null if no key. */
export async function signChallenge(message: string): Promise<string | null> {
  if (!current || !subtle) return null;
  const sig = await subtle.sign("Ed25519", current.privateKey, new TextEncoder().encode(message));
  return b64(new Uint8Array(sig));
}

/** Forget the derived key (sign-out). */
export function clearAuthKey(): void {
  current = null;
}
