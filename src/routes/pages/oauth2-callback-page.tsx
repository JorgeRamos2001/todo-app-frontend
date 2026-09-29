import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OAuth2CallbackPage() {
  return (
    <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Signing you in…</CardTitle>
          <CardDescription>OAuth2 callback handling lands in Phase 1.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
