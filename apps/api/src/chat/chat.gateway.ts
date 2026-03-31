import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ChatGateway.name)

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth['token'] as string) ||
        (client.handshake.headers['authorization'] as string)?.replace('Bearer ', '')

      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      })
      client.data['clinicId'] = payload.clinicId
      this.logger.log(`Client connected: ${client.id} (clinic ${payload.clinicId})`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('joinClinic')
  handleJoinClinic(@ConnectedSocket() client: Socket, @MessageBody() clinicId: string) {
    client.join(`clinic:${clinicId}`)
    this.logger.debug(`${client.id} joined clinic room ${clinicId}`)
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(`conv:${conversationId}`)
    this.logger.debug(`${client.id} joined conversation ${conversationId}`)
  }

  emitNewMessage(clinicId: string, conversationId: string, message: unknown) {
    this.server.to(`clinic:${clinicId}`).emit('newMessage', { conversationId, message })
    this.server.to(`conv:${conversationId}`).emit('newMessage', { conversationId, message })
  }

  emitConversationUpdated(clinicId: string, conversation: unknown) {
    this.server.to(`clinic:${clinicId}`).emit('conversationUpdated', conversation)
  }

  emitNewConversation(clinicId: string, conversation: unknown) {
    this.server.to(`clinic:${clinicId}`).emit('newConversation', conversation)
  }
}
