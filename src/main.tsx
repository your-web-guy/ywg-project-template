import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/* index.html and src/worker.ts both put tags marked `data-shell-meta` in the
 * head, for clients that never run the router (scrapers, non-JS crawlers).
 * Once the router renders each route's own head, those would sit beside them:
 * two descriptions, two og:titles, nothing deciding which wins. So they're
 * removed here, before the first render. `[data-shell-meta]` rather than
 * `meta[...]` because the Worker's canonical is a <link>. */
for (const tag of document.querySelectorAll('head [data-shell-meta]:not(title)')) {
  tag.remove()
}

/* The shell's <title> is held until the router adds its own, then dropped.
 * Removing it in the loop above would leave the tab showing the URL until
 * React renders; leaving it would mean two <title>s, with the shell's frozen at
 * whichever route was hard-loaded. If the router never renders, the shell's
 * title stays, which is the right fallback. */
const shellTitle = document.querySelector('head title[data-shell-meta]')
if (shellTitle) {
  const observer = new MutationObserver(() => {
    if (document.querySelectorAll('head title').length < 2) return
    shellTitle.remove()
    observer.disconnect()
  })
  observer.observe(document.head, { childList: true })
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
