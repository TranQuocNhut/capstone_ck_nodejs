import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUserDto {
    @ApiPropertyOptional({
        example: 'admin',
        description: 'Search query for name or email',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Page number for pagination',
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        description: 'Limit of items per page',
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
