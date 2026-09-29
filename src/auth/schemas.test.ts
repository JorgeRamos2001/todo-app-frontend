import { loginSchema, registerSchema } from '@/auth/schemas'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: 'x' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false)
  })

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: '' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts a valid payload', () => {
    const result = registerSchema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    })

    expect(result.success).toBe(true)
  })

  it('rejects passwords shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'short',
    })

    expect(result.success).toBe(false)
  })

  it('rejects passwords longer than 72 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'x'.repeat(73),
    })

    expect(result.success).toBe(false)
  })

  it('rejects names longer than 100 characters', () => {
    const result = registerSchema.safeParse({
      name: 'x'.repeat(101),
      email: 'ada@example.com',
      password: 'password123',
    })

    expect(result.success).toBe(false)
  })

  it('rejects blank names', () => {
    const result = registerSchema.safeParse({
      name: '   ',
      email: 'ada@example.com',
      password: 'password123',
    })

    expect(result.success).toBe(false)
  })
})
