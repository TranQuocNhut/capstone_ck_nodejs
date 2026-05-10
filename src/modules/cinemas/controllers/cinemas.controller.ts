import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CinemasService } from '../services/cinemas.service';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('cinemas')
@Controller('cinemas')
export class CinemasController {
  constructor(private cinemasService: CinemasService) {}

  @Public()
  @Get('systems')
  @ApiOperation({ summary: 'Get list of cinema brand systems (CGV, BHD...)' })
  @ApiResponse({
    status: 200,
    description: 'Cinema systems retrieved successfully',
  })
  async getCinemaSystems() {
    return this.cinemasService.getCinemaSystems();
  }

  @Public()
  @Get('systems/:systemId/complexes')
  @ApiOperation({
    summary: 'Get list of cinema complexes and theaters for a brand system',
  })
  @ApiResponse({
    status: 200,
    description: 'Cinema complexes retrieved successfully',
  })
  async getComplexesBySystem(
    @Param('systemId', ParseIntPipe) systemId: number,
  ) {
    return this.cinemasService.getComplexesBySystem(systemId);
  }

  @Public()
  @Get('showtimes')
  @ApiOperation({
    summary:
      'Get comprehensive schedule with active showtimes across all systems (LayThongTinLichChieuHeThongRap)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cinema system showtimes schedule retrieved successfully',
  })
  async getSystemShowtimes() {
    return this.cinemasService.getSystemShowtimes();
  }

  @Public()
  @Get('movies/:movieId/showtimes')
  @ApiOperation({
    summary: 'Get list of active showtimes for a specific movie',
  })
  @ApiResponse({
    status: 200,
    description: 'Suites of showtimes retrieved successfully',
  })
  async getShowtimesByMovie(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.cinemasService.getShowtimesByMovie(movieId);
  }
}
