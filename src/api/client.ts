export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail: string
  readonly errors: Record<string, string> | undefined

  constructor(problem: ProblemDetail) {
    super(
      problem.detail !== undefined && problem.detail !== ''
        ? problem.detail
        : (problem.title ?? 'Unexpected error'),
    )
    this.name = 'ApiError'
    this.status = problem.status ?? 0
    this.title = problem.title ?? 'Error'
    this.detail = problem.detail ?? ''
    this.errors = problem.errors
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

let accessTokenProvider: () => string | null = () => null
let unauthorizedHandler: (() => Promise<string | null>) | null = null

export function setAccessTokenProvider(provider: () => string | null): void {
  accessTokenProvider = provider
}

export function setUnauthorizedHandler(handler: (() => Promise<string | null>) | null): void {
  unauthorizedHandler = handler
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return performRequest<T>(path, options, true)
}

async function performRequest<T>(
  path: string,
  options: ApiRequestOptions,
  allowRetry: boolean,
): Promise<T> {
  const { method = 'GET', body, headers } = options
  const token = accessTokenProvider()

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'omit',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!response.ok) {
    if (response.status === 401 && allowRetry && shouldAttemptRefresh(path)) {
      const refreshedToken = await unauthorizedHandler?.()
      if (refreshedToken !== null && refreshedToken !== undefined) {
        return performRequest<T>(path, options, false)
      }
    }
    throw new ApiError(await toProblemDetail(response, contentType))
  }

  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return undefined as T
}

function shouldAttemptRefresh(path: string): boolean {
  return unauthorizedHandler !== null && !path.startsWith('/api/v1/auth/')
}

async function toProblemDetail(response: Response, contentType: string): Promise<ProblemDetail> {
  if (contentType.includes('json')) {
    const problem = (await response.json().catch(() => null)) as ProblemDetail | null
    if (problem !== null) {
      return { ...problem, status: problem.status ?? response.status }
    }
  }
  return { status: response.status, title: response.statusText || 'Request failed' }
}
