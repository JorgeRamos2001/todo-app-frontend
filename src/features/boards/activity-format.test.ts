import { describeActivity } from '@/features/boards/activity-format'

describe('describeActivity', () => {
  it('describes task events with their title', () => {
    expect(describeActivity('TASK_MOVED', { title: 'Ship v1' })).toBe('moved task “Ship v1”')
    expect(describeActivity('TASK_ASSIGNED', { title: 'Ship v1', assigneeName: 'Ada' })).toBe(
      'assigned “Ship v1” to Ada',
    )
  })

  it('falls back when details are missing', () => {
    expect(describeActivity('TASK_CREATED', null)).toBe('created a task')
    expect(describeActivity('MEMBER_REMOVED', {})).toBe('removed a member')
  })

  it('describes member and comment events', () => {
    expect(describeActivity('MEMBER_JOINED', { email: 'ada@example.com' })).toBe('joined the board')
    expect(describeActivity('COMMENT_CREATED', { preview: 'Looks good' })).toBe(
      'commented: “Looks good”',
    )
  })
})
