import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import type { Location } from 'react-router'

import { ApiError } from '@/api/client'
import { GoogleButton } from '@/auth/google-button'
import { loginSchema, type LoginValues } from '@/auth/schemas'
import { useAuth } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { APP_NAME } from '@/lib/constants'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      const from = (location.state as { from?: Location } | null)?.from
      await navigate(from === undefined ? '/' : `${from.pathname}${from.search}`, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 && error.errors !== undefined) {
          for (const [field, message] of Object.entries(error.errors)) {
            if (field === 'email' || field === 'password') {
              form.setError(field as keyof LoginValues, { type: 'server', message })
            }
          }
        }
        setFormError(error.detail !== '' ? error.detail : error.title)
        return
      }
      setFormError('Something went wrong. Please try again.')
    }
  })

  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="font-heading flex items-center gap-2 text-xl font-semibold">{APP_NAME}</div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Welcome back. Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError === null ? null : (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
            >
              {formError}
            </div>
          )}
          <form onSubmit={(event) => void onSubmit(event)} noValidate>
            <FieldGroup>
              <Field data-invalid={form.formState.errors.email !== undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={form.formState.errors.email !== undefined}
                  {...form.register('email')}
                />
                <FieldError>{form.formState.errors.email?.message}</FieldError>
              </Field>
              <Field data-invalid={form.formState.errors.password !== undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={form.formState.errors.password !== undefined}
                  {...form.register('password')}
                />
                <FieldError>{form.formState.errors.password?.message}</FieldError>
              </Field>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </FieldGroup>
          </form>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">OR</span>
            <Separator className="flex-1" />
          </div>
          <GoogleButton />
          <p className="text-muted-foreground text-center text-sm">
            No account yet?{' '}
            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
