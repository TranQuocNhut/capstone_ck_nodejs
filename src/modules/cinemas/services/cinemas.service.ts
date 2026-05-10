import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../providers/database/prisma.service';

@Injectable()
export class CinemasService implements OnModuleInit {
  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    await this.initCinemaData();
  }

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

  /**
   * Helper method to seed premium cinema brand networks if empty!
   */
  async initCinemaData() {
    const count = await this.prisma.cinemaSystem.count();
    if (count > 0) return;

    console.log('Seeding clean English cinema systems, screens and seats...');

    // 1. Create Premium Cinema Systems
    const cgv = await this.prisma.cinemaSystem.create({
      data: {
        name: 'CGV Cinema',
        logo: 'https://cloudinary.com/cgv-logo.png',
      },
    });

    const bhd = await this.prisma.cinemaSystem.create({
      data: {
        name: 'BHD Star Cineplex',
        logo: 'https://cloudinary.com/bhd-logo.png',
      },
    });

    // 2. Create Cinema Complexes
    const cgvHungVuong = await this.prisma.cinemaComplex.create({
      data: {
        name: 'CGV Hung Vuong Plaza',
        address: '126 Hung Vuong, Q.5, TP.HCM',
        systemId: cgv.id,
      },
    });

    const bhdThaoDien = await this.prisma.cinemaComplex.create({
      data: {
        name: 'BHD Star Thao Dien',
        address: 'Vincom Thao Dien, Q.2, TP.HCM',
        systemId: bhd.id,
      },
    });

    // 3. Create Cinema Theaters
    const cgvTheater = await this.prisma.theater.create({
      data: {
        name: 'Theater 1 (IMAX)',
        complexId: cgvHungVuong.id,
      },
    });

    const bhdTheater = await this.prisma.theater.create({
      data: {
        name: 'Theater Gold Class',
        complexId: bhdThaoDien.id,
      },
    });

    // 4. Generate Seats (30 seats per theater)
    const cgvSeatsData = Array.from({ length: 30 }, (_, index) => {
      const seatNum = index + 1;
      return {
        name: seatNum < 10 ? `A0${seatNum}` : `A${seatNum}`,
        type: seatNum > 20 ? 'VIP' : 'Regular',
        theaterId: cgvTheater.id,
      };
    });

    const bhdSeatsData = Array.from({ length: 30 }, (_, index) => {
      const seatNum = index + 1;
      return {
        name: seatNum < 10 ? `B0${seatNum}` : `B${seatNum}`,
        type: seatNum > 20 ? 'VIP' : 'Regular',
        theaterId: bhdTheater.id,
      };
    });

    await this.prisma.seat.createMany({ data: cgvSeatsData });
    await this.prisma.seat.createMany({ data: bhdSeatsData });

    console.log('Seeding clean English cinema network successfully finished!');
  }
}
