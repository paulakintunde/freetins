import { constantTimeEqual, createSignedToken, verifySignedToken } from './security';

const cookieName = '__Host-freetins-editor';
const sessionDurationSeconds = 8 * 60 * 60;

const readCookie = (request: Request, name: string) => request.headers.get('Cookie')
  ?.split(';')
  .map((part) => part.trim().split('='))
  .find(([key]) => key === name)
  ?.slice(1)
  .join('=') ?? null;

export const hasEditorialAccess = async (request: Request, sessionSecret?: string) => {
  if (!sessionSecret) return false;
  const token = readCookie(request, cookieName);
  if (!token) return false;
  return (await verifySignedToken(token, sessionSecret)) === 'editor';
};

export const passwordMatches = (submitted: string, configured?: string) =>
  Boolean(configured) && constantTimeEqual(submitted, configured ?? '');

export const createEditorialSessionCookie = async (sessionSecret: string) => {
  const expiresAt = new Date(Date.now() + sessionDurationSeconds * 1_000);
  const token = await createSignedToken('editor', sessionSecret, expiresAt);
  return `${cookieName}=${token}; Path=/; Max-Age=${sessionDurationSeconds}; HttpOnly; Secure; SameSite=Strict`;
};

export const clearEditorialSessionCookie = () =>
  `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
