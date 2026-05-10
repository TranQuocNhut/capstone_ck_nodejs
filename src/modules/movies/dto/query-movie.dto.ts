import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryMovieDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search query for movie title (alias for search)',
    example: 'Doctor Strange',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
