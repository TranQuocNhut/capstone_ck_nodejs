import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Johnathan Doe',
    description: 'Updated full name',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Updated phone number',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'I love movies!',
    description: 'Bio of the user profile',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
