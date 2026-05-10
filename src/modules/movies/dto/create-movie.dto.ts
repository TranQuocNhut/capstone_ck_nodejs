import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMovieDto {
  @ApiProperty({
    example: 'Doctor Strange in the Multiverse of Madness',
    description: 'Title of the movie',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'https://www.youtube.com/embed/aWzlQ2N6qqg',
    description: 'Trailer URL',
  })
  @IsString()
  @IsNotEmpty()
  trailer: string;

  @ApiProperty({
    example: 'https://cloudinary.com/strange.jpg',
    description: 'Image URL of the movie poster',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    example: 'Doctor Strange travels into the multiverse...',
    description: 'Movie description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2026-05-10T00:00:00.000Z',
    description: 'Release date of the movie',
  })
  @Type(() => Date)
  @IsNotEmpty()
  releaseDate: Date;

  @ApiProperty({ example: 10, description: 'Rating (1 to 10)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;

  @ApiProperty({ example: true, description: 'Is it a popular hot release?' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isHot: boolean;

  @ApiProperty({ example: true, description: 'Is it currently showing?' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isShowing: boolean;

  @ApiProperty({ example: false, description: 'Is it coming soon?' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isComing: boolean;
}
