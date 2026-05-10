import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'your_reset_token_here',
    description: 'The token received in the reset password email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'The new password for the user account',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
