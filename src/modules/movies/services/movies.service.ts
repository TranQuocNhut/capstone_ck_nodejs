import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../providers/database/prisma.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { CloudinaryService } from '../../../providers/cloudinary/cloudinary.service';

@Injectable()
export class MoviesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async getBanners() {
    return this.prisma.banner.findMany({
      include: {
        movie: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  async getMovies(title?: string, page = 1, limit = 10) {
    const where: any = {};
    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      data: movies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMovieById(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException(`Movie not found with ID: ${id}`);
    }

    return movie;
  }

  async getMoviesByReleaseDate(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.releaseDate = {};
      if (startDate) where.releaseDate.gte = new Date(startDate);
      if (endDate) where.releaseDate.lte = new Date(endDate);
    }

    return this.prisma.movie.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
    });
  }

  async createMovie(
    createMovieDto: CreateMovieDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl = createMovieDto.imageUrl;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    }

    const movie = await this.prisma.movie.create({
      data: {
        ...createMovieDto,
        imageUrl,
      },
    });

    // Automatically generate a banner for the new movie
    try {
      await this.prisma.banner.create({
        data: {
          movieId: movie.id,
          imageUrl: movie.imageUrl,
        },
      });
    } catch (err) {
      console.error('Failed to create movie banner', err);
    }

    return movie;
  }

  async updateMovie(
    id: number,
    updateMovieDto: UpdateMovieDto,
    file?: Express.Multer.File,
  ) {
    await this.getMovieById(id);

    const updateData: any = { ...updateMovieDto };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      updateData.imageUrl = uploadResult.secure_url;
    }

    return this.prisma.movie.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMovie(id: number) {
    await this.getMovieById(id);

    await this.prisma.movie.delete({
      where: { id },
    });

    return { message: 'Movie deleted successfully' };
  }
}
