import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">YWG Project Template</h1>
        <p className="mt-4 text-muted-foreground">Replace this with your project.</p>
      </div>
    </div>
  )
}
