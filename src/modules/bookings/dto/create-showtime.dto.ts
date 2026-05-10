import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShowtimeDto {
  @ApiProperty({ example: 1, description: 'ID of the theater room' })
  @IsInt()
  @IsNotEmpty()
  theaterId: number;

  @ApiProperty({ example: 1, description: 'ID of the movie' })
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @ApiProperty({
    example: '2026-05-10T20:00:00.000Z',
    description: 'Suites of Date and Time for the show',
  })
  @Type(() => Date)
  @IsNotEmpty()
  showTime: Date;

  @ApiProperty({ example: 120000, description: 'Ticket price in VND' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;
}
