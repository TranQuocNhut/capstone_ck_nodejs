import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('history/:room')
  @ApiOperation({ summary: 'Get chat history for a specific room' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of messages to load',
    type: Number,
  })
  @ApiQuery({
    name: 'beforeId',
    required: false,
    description:
      'Message ID to load older messages before it (cursor-based pagination)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Chat history retrieved successfully',
  })
  async getChatHistory(
    @Param('room') room: string,
    @Query('limit') limit?: number,
    @Query('beforeId') beforeId?: string,
  ) {
    const messageLimit = limit ? parseInt(limit.toString(), 10) : 50;
    return this.chatService.getMessagesByRoom(room, messageLimit, beforeId);
  }
}
