import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../services/chat.service';
import { Logger } from '@nestjs/common';
interface AuthenticatedSocket extends Socket {
  user?: {
    sub: number | string;
    email: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // 1. Extract token from handshake auth or headers
      let token = client.handshake.auth?.token;
      if (!token) {
        const authHeader = client.handshake.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (!token) {
        this.logger.warn(
          `Client ${client.id} connected without token. Disconnecting...`,
        );
        client.disconnect();
        return;
      }

      // 2. Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // 3. Attach user payload to socket
      client.user = payload;
      this.logger.log(
        `Client ${client.id} authenticated as User: ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}. Disconnecting...`,
        error,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!data.room) return;
    client.join(data.room);
    this.logger.log(`User ${client.user?.email} joined room: ${data.room}`);
    client.emit('joined_room', { room: data.room });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!data.room) return;
    client.leave(data.room);
    this.logger.log(`User ${client.user?.email} left room: ${data.room}`);
    client.emit('left_room', { room: data.room });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; content: string },
  ) {
    if (!client.user) return;
    if (!data.room || !data.content) return;

    // Save message to Database
    const savedMessage = await this.chatService.saveMessage(
      client.user.sub,
      data.content,
      data.room,
    );

    // Broadcast message to everyone in the room
    this.server.to(data.room).emit('new_message', savedMessage);
    this.logger.log(
      `Message in room ${data.room} from ${client.user.email} broadcasted`,
    );
  }
}
