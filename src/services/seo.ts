/* Per-route SEO: title, description, canonical and social card, in one place.
 *
 * Fill this in from the approved route inventory (setup guide Part 2, Step 5)
 * before the first staging deploy. scripts/provision.sh fills in the project
 * name and production domain placeholders; the copy below is yours to write.
 *
 * Why the copy lives here and not in the route files: social scrapers
 * (Facebook, LinkedIn, Slack, iMessage, X) don't run JavaScript, so the tags the
 * router sets in the browser never reach a link preview. src/worker.ts rewrites
 * them into the HTML shell instead, and a Worker can't import a route file
 * without pulling React into its bundle. So both sides read this map.
 *
 * Every description is hand-written for its page. A templated one
 * ("Site Name | {route}") is filler Google rewrites anyway.
 *
 * Imported by the Worker, so nothing here may touch `document` or `window`:
 * tsconfig.worker.json checks it without the DOM lib.
 *
 * Pattern from richardstuart-me (#76), generalized for TICKET-TPL-01. */

/** The production domain, on every environment. See `canonicalUrl`. */
export const SITE_URL = 'https://[DOMAIN]'
/** provision.sh fills in the repo slug; change it to the display name. */
export const SITE_NAME = '[PROJECT-NAME]'

/** The default social card: 1200×630 PNG in public/og/. */
export const OG_IMAGE = `${SITE_URL}/og/[PROJECT-NAME].png`
const OG_IMAGE_ALT = '[PROJECT-NAME]'

export type RouteMeta = {
  /** The full <title>. Written per route, not assembled from a template. */
  title: string
  /** ~150–160 characters, describing this page and no other. */
  description: string
  /** No canonical, no social card, `robots: noindex, nofollow`. */
  noindex?: boolean
}

/**
 * Static routes, keyed by the path they answer on. Add one entry per route
 * file in src/routes/ and give the route `head: () => staticRouteHead('/path')`.
 */
export const ROUTE_META = {
  '/': {
    title: '[PROJECT-NAME]',
    description: '[Home page description, ~150–160 characters, written for this page.]',
  },
} satisfies Record<string, RouteMeta>

/** Strips a trailing slash, so `/about/` and `/about` share one key and one
 *  canonical. The root stays `/`. */
export function canonicalPath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

/**
 * Resolve a pathname to its metadata. The Worker uses this: it has a URL and no
 * router. Returns `null` for anything unrecognised, and the Worker then leaves
 * the shell's default card in place rather than inventing one.
 *
 * Dynamic routes (`/blog/$slug` and the like) go here too: match the prefix,
 * look the slug up in the same data the route reads, and return a `noindex`
 * not-found entry on a miss so invented slugs don't index as duplicates.
 */
export function resolveRouteMeta(pathname: string): RouteMeta | null {
  const path = canonicalPath(pathname)
  if (path in ROUTE_META) return ROUTE_META[path as keyof typeof ROUTE_META]
  return null
}

export type MetaTag = { name?: string; property?: string; content: string }

/**
 * Every meta tag a route gets, in one list, so the router and the Worker can
 * never disagree about a page's card. A noindexed route gets no social card:
 * it only makes sense for a page you want shared.
 */
export function routeMetaTags(meta: RouteMeta, url: string): MetaTag[] {
  const tags: MetaTag[] = [{ name: 'description', content: meta.description }]

  if (meta.noindex) {
    tags.push({ name: 'robots', content: 'noindex, nofollow' })
    return tags
  }

  tags.push(
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: OG_IMAGE },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: OG_IMAGE_ALT },
    /* summary_large_image: the small variant crops a 1200×630 card square. */
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
    { name: 'twitter:image', content: OG_IMAGE },
    { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
  )

  return tags
}

/** The canonical URL for a path. Always the production domain, never the host
 *  the request came in on: staging serves the same shell, and a canonical
 *  pointing at workers.dev would ask Google to index the wrong copy. */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${canonicalPath(path)}`
}

/** A route's `head()` for TanStack Router. Rendered by <HeadContent /> in
 *  src/routes/__root.tsx. */
export function pageHead({ title, description, path, noindex = false }: RouteMeta & { path: string }): {
  meta: (MetaTag | { title: string })[]
  links: { rel: string; href: string }[]
} {
  const url = canonicalUrl(path)
  return {
    meta: [{ title }, ...routeMetaTags({ title, description, noindex }, url)],
    links: noindex ? [] : [{ rel: 'canonical', href: url }],
  }
}

/** `head()` for a route whose copy lives in `ROUTE_META`. */
export function staticRouteHead(path: keyof typeof ROUTE_META): ReturnType<typeof pageHead> {
  return pageHead({ ...ROUTE_META[path], path })
}
