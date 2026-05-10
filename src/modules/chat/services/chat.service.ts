import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(userId: number | string, content: string, room: string) {
    const parsedUserId =
      typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.prisma.message.create({
      data: {
        userId: parsedUserId,
        content,
        room,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async getMessagesByRoom(room: string, limit = 50, beforeId?: string) {
    const where: any = { room };

    if (beforeId) {
      where.id = {
        lt: beforeId,
      };
    }

    return this.prisma.message.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }
}
