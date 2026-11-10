import { describe, it, expect } from 'vitest'
import {
  canonicalPath,
  canonicalUrl,
  pageHead,
  resolveRouteMeta,
  routeMetaTags,
  ROUTE_META,
  SITE_URL,
} from './seo'

const content = (tags: ReturnType<typeof routeMetaTags>, key: string) =>
  tags.find((t) => t.name === key || t.property === key)?.content

describe('canonicalPath', () => {
  it('strips trailing slashes but keeps the root', () => {
    expect(canonicalPath('/')).toBe('/')
    expect(canonicalPath('//')).toBe('/')
    expect(canonicalPath('/about/')).toBe('/about')
    expect(canonicalPath('/about//')).toBe('/about')
  })
})

describe('canonicalUrl', () => {
  it('always points at the production domain', () => {
    expect(canonicalUrl('/about/')).toBe(`${SITE_URL}/about`)
  })
})

describe('resolveRouteMeta', () => {
  it('finds every static route, with or without a trailing slash', () => {
    for (const path of Object.keys(ROUTE_META)) {
      expect(resolveRouteMeta(path)).toEqual(ROUTE_META[path as keyof typeof ROUTE_META])
      expect(resolveRouteMeta(`${path}/`)).toEqual(ROUTE_META[path as keyof typeof ROUTE_META])
    }
  })

  it('returns null for an unknown path, so the shell default stays', () => {
    expect(resolveRouteMeta('/no-such-page')).toBeNull()
  })
})

describe('routeMetaTags', () => {
  const meta = { title: 'About', description: 'About this site.' }

  it('gives an indexable route its own social card', () => {
    const tags = routeMetaTags(meta, `${SITE_URL}/about`)
    expect(content(tags, 'description')).toBe('About this site.')
    expect(content(tags, 'og:title')).toBe('About')
    expect(content(tags, 'og:url')).toBe(`${SITE_URL}/about`)
    expect(content(tags, 'robots')).toBeUndefined()
  })

  it('gives a noindex route a robots tag and no social card', () => {
    const tags = routeMetaTags({ ...meta, noindex: true }, `${SITE_URL}/about`)
    expect(content(tags, 'robots')).toBe('noindex, nofollow')
    expect(content(tags, 'og:title')).toBeUndefined()
  })
})

describe('pageHead', () => {
  it('adds a canonical only for indexable routes', () => {
    expect(pageHead({ title: 'A', description: 'B', path: '/a' }).links).toEqual([
      { rel: 'canonical', href: `${SITE_URL}/a` },
    ])
    expect(pageHead({ title: 'A', description: 'B', path: '/a', noindex: true }).links).toEqual([])
  })
})
