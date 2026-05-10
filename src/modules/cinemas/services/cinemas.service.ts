import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/database/prisma.service';

@Injectable()
export class CinemasService {
  constructor(private prisma: PrismaService) {}

  async getCinemaSystems() {
    return this.prisma.cinemaSystem.findMany();
  }

  async getComplexesBySystem(systemId: number) {
    return this.prisma.cinemaComplex.findMany({
      where: { systemId },
      include: {
        theaters: {
          include: {
            seats: true,
          },
        },
      },
    });
  }

  async getShowtimesByMovie(movieId: number) {
    return this.prisma.showtime.findMany({
      where: { movieId },
      include: {
        theater: {
          include: {
            complex: {
              include: {
                system: true,
              },
            },
          },
        },
      },
    });
  }

  async getSystemShowtimes() {
    return this.prisma.cinemaSystem.findMany({
      include: {
        complexes: {
          include: {
            theaters: {
              include: {
                showtimes: {
                  include: {
                    movie: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
