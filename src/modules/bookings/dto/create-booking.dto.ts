import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID of the showtime' })
  @IsInt()
  @IsNotEmpty()
  showtimeId: number;

  @ApiProperty({ example: [1, 2, 3], description: 'List of seat IDs to book' })
  @IsArray()
  @IsNotEmpty()
  seatIds: number[];
}
