import { apiRequest } from '@/api/client'
import { initializeAuth } from '@/auth/session'
import { useAuthStore } from '@/auth/store'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function problemResponse(status: number): Response {
  return new Response(
    JSON.stringify({ title: 'Unauthorized', status, detail: 'Authentication required' }),
    { status, headers: { 'content-type': 'application/problem+json' } },
  )
}

describe('refresh singleton interceptor', () => {
  beforeEach(() => {
    initializeAuth()
    window.localStorage.clear()
    useAuthStore.setState({
      accessToken: 'expired-token',
      refreshToken: 'refresh-1',
      user: null,
      isRestoring: false,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    window.localStorage.clear()
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isRestoring: false,
    })
  })

  it('refreshes only once when concurrent requests receive a 401', async () => {
    let refreshCalls = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/api/v1/auth/refresh')) {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 10))
        return jsonResponse({
          accessToken: 'fresh-token',
          refreshToken: 'refresh-2',
          tokenType: 'Bearer',
          expiresIn: 900,
        })
      }

      const headers = init?.headers as Record<string, string> | undefined
      if (headers?.Authorization === 'Bearer fresh-token') {
        return jsonResponse([{ id: 1 }])
      }
      return problemResponse(401)
    })
    vi.stubGlobal('fetch', fetchMock)

    const [first, second] = await Promise.all([
      apiRequest('/api/v1/boards'),
      apiRequest('/api/v1/boards'),
    ])

    expect(refreshCalls).toBe(1)
    expect(first).toEqual([{ id: 1 }])
    expect(second).toEqual([{ id: 1 }])
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
    expect(useAuthStore.getState().refreshToken).toBe('refresh-2')
  })

  it('does not attempt a refresh for auth endpoints', async () => {
    let refreshCalls = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/api/v1/auth/login')) {
        return problemResponse(401)
      }
      refreshCalls += 1
      return jsonResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'a@b.com', password: 'wrong' },
      }),
    ).rejects.toMatchObject({ status: 401, detail: 'Authentication required' })
    expect(refreshCalls).toBe(0)
  })
})
