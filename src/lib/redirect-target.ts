/**
 * Validate the `next` query parameter for auth redirects.
 *
 * Only allows single-leading-slash relative paths (e.g. "/dashboard",
 * "/auth/settings?tab=profile"). Rejects everything else — including
 * protocol-relative URLs (`//evil.com`), backslash-prefixed paths
 * (`/\evil.com`), absolute URLs (`https://evil.com`), and encoded
 * bypass attempts (`/%2F%2Fevil.com`) — by falling back to "/".
 *
 * This prevents open-redirect / phishing attacks where a crafted
 * callback URL would bounce the freshly-authenticated user to an
 * attacker-controlled site.
 */
const SAFE_NEXT_RE = /^\/[A-Za-z0-9._~!$&'()*+,;=:@/?-]*$/

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/"
  if (!raw.startsWith("/")) return "/"
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/"
  if (!SAFE_NEXT_RE.test(raw)) return "/"
  return raw
}