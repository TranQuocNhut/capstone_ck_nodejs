import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { MoviesService } from '../services/movies.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { QueryMovieDto } from '../dto/query-movie.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Public()
  @Get('banners')
  @ApiOperation({ summary: 'Get list of movie advertising banners' })
  @ApiResponse({ status: 200, description: 'Banners retrieved successfully' })
  async getBanners() {
    return this.moviesService.getBanners();
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get list of movies with search and pagination support',
  })
  @ApiResponse({
    status: 200,
    description: 'Movies list retrieved successfully',
  })
  async getMovies(@Query() query: QueryMovieDto) {
    const search = query.title || query.search;
    return this.moviesService.getMovies(search, query.page, query.limit);
  }

  @Public()
  @Get('by-date')
  @ApiOperation({ summary: 'Get list of movies sorted by release date' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date boundary (ISO)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date boundary (ISO)',
  })
  @ApiResponse({ status: 200, description: 'Movies retrieved' })
  async getMoviesByReleaseDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.moviesService.getMoviesByReleaseDate(startDate, endDate);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get detailed information about a single movie' })
  @ApiResponse({
    status: 200,
    description: 'Movie details retrieved successfully',
  })
  async getMovieById(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new movie (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Movie successfully created' })
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.createMovie(createMovieDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Movie poster image file (jpg, jpeg, png, webp)',
        },
        title: { type: 'string', description: 'Title of the movie' },
        trailer: { type: 'string', description: 'Trailer URL' },
        imageUrl: {
          type: 'string',
          description: 'Image URL of the movie poster',
        },
        description: { type: 'string', description: 'Movie description' },
        releaseDate: {
          type: 'string',
          format: 'date-time',
          description: 'Release date of the movie (ISO 8601)',
        },
        rating: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          description: 'Rating (1 to 10)',
        },
        isHot: { type: 'boolean', description: 'Is it a popular hot release?' },
        isShowing: { type: 'boolean', description: 'Is it currently showing?' },
        isComing: { type: 'boolean', description: 'Is it coming soon?' },
      },
      required: [
        'file',
        'title',
        'trailer',
        'imageUrl',
        'description',
        'releaseDate',
        'rating',
        'isHot',
        'isShowing',
        'isComing',
      ],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Create a new movie with image file upload (ThemPhimUploadHinh)',
  })
  @ApiResponse({
    status: 201,
    description: 'Movie with poster successfully created',
  })
  async createMovieWithUpload(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.moviesService.createMovie(createMovieDto, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update detailed info of a movie (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'Movie details successfully updated',
  })
  async updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.updateMovie(id, updateMovieDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New movie poster image file (jpg, jpeg, png, webp)',
        },
        title: { type: 'string', description: 'Title of the movie' },
        trailer: { type: 'string', description: 'Trailer URL' },
        imageUrl: {
          type: 'string',
          description: 'Image URL of the movie poster',
        },
        description: { type: 'string', description: 'Movie description' },
        releaseDate: {
          type: 'string',
          format: 'date-time',
          description: 'Release date of the movie (ISO 8601)',
        },
        rating: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          description: 'Rating (1 to 10)',
        },
        isHot: { type: 'boolean', description: 'Is it a popular hot release?' },
        isShowing: { type: 'boolean', description: 'Is it currently showing?' },
        isComing: { type: 'boolean', description: 'Is it coming soon?' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Update a movie with file upload (CapNhatPhimUpload)',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie poster and info successfully updated',
  })
  async updateMovieWithUpload(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.moviesService.updateMovie(id, updateMovieDto, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a movie from the system (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Movie successfully deleted' })
  async deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.deleteMovie(id);
  }
}
