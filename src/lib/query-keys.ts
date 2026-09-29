export const queryKeys = {
  boards: ['boards'] as const,
  board: (boardId: number) => ['boards', boardId] as const,
  boardMembers: (boardId: number) => ['boards', boardId, 'members'] as const,
}
