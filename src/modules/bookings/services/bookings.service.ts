import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../providers/database/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateShowtimeDto } from '../dto/create-showtime.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: number, createBookingDto: CreateBookingDto) {
    const { showtimeId, seatIds } = createBookingDto;

    // 1. Verify showtime exists
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
    });

    if (!showtime) {
      throw new NotFoundException(`Showtime not found with ID: ${showtimeId}`);
    }

    // 2. Atomic reservation transaction
    return this.prisma.$transaction(async (tx) => {
      const existingBookings = await tx.booking.findMany({
        where: {
          showtimeId,
          seatId: { in: seatIds },
        },
      });

      if (existingBookings.length > 0) {
        const bookedSeatIds = existingBookings.map((b) => b.seatId).join(', ');
        throw new ConflictException(
          `The following seats are already booked: [${bookedSeatIds}]`,
        );
      }

      // Create bookings
      const bookingsData = seatIds.map((seatId) => ({
        userId,
        showtimeId,
        seatId,
      }));

      await tx.booking.createMany({
        data: bookingsData,
      });

      return {
        message: 'Seats booked successfully!',
        userId,
        showtimeId,
        bookedSeatsCount: seatIds.length,
        seatIds,
      };
    });
  }

  async getTicketOfficeList(showtimeId: number) {
    // 1. Fetch showtime with movie and cinema theater
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: true,
        theater: {
          include: {
            complex: {
              include: {
                system: true,
              },
            },
            seats: {
              orderBy: { name: 'asc' },
            },
          },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException(`Showtime not found with ID: ${showtimeId}`);
    }

    // 2. Fetch existing bookings for this showtime
    const bookings = await this.prisma.booking.findMany({
      where: { showtimeId },
    });

    const bookedSeatsSet = new Set(bookings.map((b) => b.seatId));

    // 3. Map all seats
    const seatsList = showtime.theater.seats.map((seat) => {
      const isBooked = bookedSeatsSet.has(seat.id);
      const bookingDetail = isBooked
        ? bookings.find((b) => b.seatId === seat.id)
        : null;
      return {
        id: seat.id,
        name: seat.name,
        type: seat.type,
        theaterId: seat.theaterId,
        isBooked,
        bookedByUserId: bookingDetail ? bookingDetail.userId : null,
      };
    });

    return {
      movieInfo: {
        showtimeId: showtime.id,
        movieTitle: showtime.movie.title,
        movieImageUrl: showtime.movie.imageUrl,
        showTime: showtime.showTime,
        price: showtime.price,
        theaterName: showtime.theater.name,
        complexName: showtime.theater.complex.name,
        systemName: showtime.theater.complex.system.name,
      },
      seats: seatsList,
    };
  }

  async createShowtime(dto: CreateShowtimeDto) {
    // Verify movie and theater exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie not found with ID: ${dto.movieId}`);
    }

    const theater = await this.prisma.theater.findUnique({
      where: { id: dto.theaterId },
    });
    if (!theater) {
      throw new NotFoundException(
        `Theater not found with ID: ${dto.theaterId}`,
      );
    }

    return this.prisma.showtime.create({
      data: dto,
    });
  }
}
