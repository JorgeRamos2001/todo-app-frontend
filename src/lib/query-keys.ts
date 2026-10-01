export const queryKeys = {
  boards: ['boards'] as const,
  board: (boardId: number) => ['boards', boardId] as const,
  boardMembers: (boardId: number) => ['boards', boardId, 'members'] as const,
  boardInvitations: (boardId: number) => ['boards', boardId, 'invitations'] as const,
  boardActivities: (boardId: number) => ['boards', boardId, 'activities'] as const,
  invitations: ['invitations'] as const,
}
