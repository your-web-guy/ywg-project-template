/**
 * Cloudflare Worker entry.
 *
 * The site is a static SPA served by the ASSETS binding, with deep links
 * falling back to index.html (`not_found_handling` in wrangler.toml). The
 * Worker sees every request except /assets/* (`run_worker_first`), and does
 * one thing: an HTML response for a known route gets that route's title,
 * description, canonical and social card rewritten into its <head>, so link
 * previews and non-JavaScript crawlers see the right page. Everything else is
 * returned exactly as the asset server produced it.
 *
 * Add API routes above the asset fallthrough. When there are several, mount
 * Hono here and keep the fallthrough as its catch-all.
 *
 * Pattern from richardstuart-me (#76), generalized for TICKET-TPL-01.
 */

import { canonicalUrl, type MetaTag, resolveRouteMeta, type RouteMeta, routeMetaTags } from './services/seo'

type Env = {
  ASSETS: Fetcher
}

/* Everything written into an attribute below goes through this. The strings
 * are repo-authored today, but a title with a quote or an ampersand would
 * otherwise break the tag. */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

const escapeAttribute = (value: string): string => value.replace(/[&<>"]/g, (ch) => ESCAPES[ch])

/* Injected tags carry `data-shell-meta`, the same marker index.html puts on its
 * defaults. src/main.tsx removes everything with that marker as soon as the
 * router can render its own, so the page never hydrates with two of each tag. */
const renderTag = (tag: MetaTag): string =>
  `<meta data-shell-meta ${tag.name ? 'name' : 'property'}="${tag.name ?? tag.property}" content="${escapeAttribute(tag.content)}">`

/**
 * Rewrite the SPA shell's head for one route. HTMLRewriter is built into the
 * Workers runtime and streams the document rather than buffering it.
 *
 * 1. <title> has its content replaced. A second <title> would be ignored.
 * 2. The shell's default `meta[data-shell-meta]` tags are removed, so a scraper
 *    never sees two competing og:titles.
 * 3. The route's tags, and a canonical for indexable routes, are appended to
 *    <head>. HTMLRewriter doesn't feed appended content back through its own
 *    selectors, so step 2 can't remove step 3's output.
 */
function rewriteHead(response: Response, meta: RouteMeta, url: string): Response {
  const tags = routeMetaTags(meta, url).map(renderTag)
  if (!meta.noindex) {
    tags.push(`<link data-shell-meta rel="canonical" href="${escapeAttribute(url)}">`)
  }

  return new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(meta.title)
      },
    })
    .on('meta[data-shell-meta]', {
      element(element) {
        element.remove()
      },
    })
    .on('head', {
      element(element) {
        element.append(tags.join(''), { html: true })
      },
    })
    .transform(response)
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)

    if (!response.headers.get('content-type')?.includes('text/html')) return response

    const { pathname } = new URL(request.url)
    const meta = resolveRouteMeta(pathname)
    if (!meta) return response

    return rewriteHead(response, meta, canonicalUrl(pathname))
  },
} satisfies ExportedHandler<Env>
