import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import type { RealtimeEvent } from '@/realtime/events'

export type RealtimeStatus = 'connecting' | 'live' | 'reconnecting' | 'offline'

interface SubscribeOptions {
  boardId: number
  token: string
  onEvent: (event: RealtimeEvent) => void
  onStatus: (status: RealtimeStatus) => void
  onReconnect: () => void
}

export function subscribeToBoard(options: SubscribeOptions): () => void {
  let connectedOnce = false

  const client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    connectHeaders: { Authorization: `Bearer ${options.token}` },
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  })

  client.onConnect = () => {
    if (connectedOnce) {
      options.onReconnect()
    }
    connectedOnce = true
    options.onStatus('live')
    client.subscribe(`/topic/boards/${options.boardId}`, (message: IMessage) => {
      try {
        options.onEvent(JSON.parse(message.body) as RealtimeEvent)
      } catch {
        return
      }
    })
  }

  client.onWebSocketClose = () => {
    options.onStatus(connectedOnce ? 'reconnecting' : 'connecting')
  }

  client.onStompError = () => {
    options.onStatus('reconnecting')
  }

  client.activate()

  return () => {
    options.onStatus('offline')
    void client.deactivate()
  }
}
