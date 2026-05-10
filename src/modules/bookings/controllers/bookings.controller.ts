import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateShowtimeDto } from '../dto/create-showtime.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Book movie tickets (User must be logged in)' })
  @ApiResponse({ status: 201, description: 'Tickets successfully booked' })
  async createBooking(
    @CurrentUser('id') userId: number,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(userId, createBookingDto);
  }

  @Public()
  @Get('showtimes/:showtimeId/ticket-office')
  @ApiOperation({
    summary: 'Get list of seats and status for a specific showtime',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket office seating status retrieved successfully',
  })
  async getTicketOfficeList(
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
  ) {
    return this.bookingsService.getTicketOfficeList(showtimeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('showtimes')
  @ApiOperation({ summary: 'Create a new movie showtime slot (Admin Only)' })
  @ApiResponse({
    status: 201,
    description: 'Showtime slot successfully registered',
  })
  async createShowtime(@Body() createShowtimeDto: CreateShowtimeDto) {
    return this.bookingsService.createShowtime(createShowtimeDto);
  }
}
