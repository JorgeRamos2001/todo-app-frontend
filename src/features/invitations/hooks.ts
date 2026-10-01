import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  acceptInvitation,
  createInvitation,
  fetchReceivedInvitations,
  rejectInvitation,
  type CreateInvitationRequest,
} from '@/api/invitations'
import { queryKeys } from '@/lib/query-keys'

export function useReceivedInvitations() {
  return useQuery({
    queryKey: queryKeys.invitations,
    queryFn: fetchReceivedInvitations,
  })
}

export function useCreateInvitation(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateInvitationRequest) => createInvitation(boardId, body),
    onSuccess: async () => {
      toast.success('Invitation sent')
      await queryClient.invalidateQueries({ queryKey: queryKeys.boardInvitations(boardId) })
    },
  })
}

export function useAcceptInvitation(options: { silentError?: boolean } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
    meta: options.silentError === true ? { skipErrorToast: true } : undefined,
    onSuccess: async () => {
      toast.success('Invitation accepted')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.invitations }),
        queryClient.invalidateQueries({ queryKey: queryKeys.boards }),
      ])
    },
  })
}

export function useRejectInvitation(options: { silentError?: boolean } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => rejectInvitation(token),
    meta: options.silentError === true ? { skipErrorToast: true } : undefined,
    onSuccess: async () => {
      toast.success('Invitation declined')
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations })
    },
  })
}
