// Absolute base URL of the deployment. Needed for sitemap/robots and for the
// `metadataBase` that makes Open Graph URLs absolute.
//
// Resolution order:
//   1. NEXT_PUBLIC_SITE_URL — set this in production (same var the logout
//      redirect already uses).
//   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain on Vercel.
//   3. VERCEL_URL — the per-deployment preview domain.
//   4. localhost, for `npm run dev`.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`

  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl()

/** Join a root-relative path onto SITE_URL. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
