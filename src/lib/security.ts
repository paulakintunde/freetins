const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');

const fromBase64Url = (value: string) => {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
};

const importHmacKey = (secret: string) => crypto.subtle.importKey(
  'raw',
  encoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify'],
);

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

export const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
};

/** Creates a keyed, non-reversible lookup value for private contact data. */
export const hmacSha256 = async (value: string, secret: string) => {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await importHmacKey(secret),
    encoder.encode(value),
  );
  return bytesToHex(new Uint8Array(signature));
};

export const constantTimeEqual = (left: string, right: string) => {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
};

export const createOpaqueToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

export const isOpaqueToken = (value: string) => /^[A-Za-z0-9_-]{43}$/.test(value);

export const createReferenceId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

export const createSignedToken = async (subject: string, secret: string, expiresAt: Date) => {
  const payload = `${subject}.${expiresAt.getTime()}`;
  const signature = await crypto.subtle.sign('HMAC', await importHmacKey(secret), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
};

export const verifySignedToken = async (token: string, secret: string) => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [subject, expiresAtRaw, signature] = parts;
  if (!subject || !expiresAtRaw || !signature || !/^\d{13}$/.test(expiresAtRaw)) return null;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await importHmacKey(secret),
      fromBase64Url(signature),
      encoder.encode(`${subject}.${expiresAtRaw}`),
    );
    return valid ? subject : null;
  } catch {
    return null;
  }
};
