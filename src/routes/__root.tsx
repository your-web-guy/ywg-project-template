import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Renders each route's head(): title, description, canonical and social
          card, from src/services/seo.ts. */}
      <HeadContent />
      <Outlet />
    </>
  ),
})
