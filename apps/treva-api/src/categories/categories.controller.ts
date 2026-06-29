import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured project categories (combined from off-plan + CMS)' })
  async findFeatured() {
    // 1. Get all categories from treva-api (off-plan)
    const categories = await this.categoriesService.findAll();

    // 2. Get display data from cms-api (image, brand, description)
    let cmsData: Record<string, any> = {};
    try {
      const cmsUrl = process.env.CMS_API_URL || 'http://localhost:10021';
      const res = await fetch(`${cmsUrl}/layihelerimiz/categories/visible`);
      if (res.ok) {
        const cmsCategories = await res.json();
        for (const cat of cmsCategories) {
          cmsData[cat.slug] = cat;
        }
      }
    } catch {}

    // 3. Combine: all categories, with image/brand from cms-api if available
    return categories.map((cat) => {
      const cms = cmsData[cat.slug];
      const cmsTitle = cms?.title;
      const title = (cmsTitle && typeof cmsTitle === 'object') ? cmsTitle : { az: cat.title, en: cat.title, ru: cat.title };
      const description = (cms?.description && typeof cms.description === 'object') ? cms.description : (cms?.description ? { az: cms.description, en: cms.description, ru: cms.description } : null);
      const brand = (cms?.brand && typeof cms.brand === 'object') ? cms.brand : (cms?.brand ? { az: cms.brand, en: cms.brand, ru: cms.brand } : null);
      return {
        id: cat.id,
        title,
        slug: cat.slug,
        image: cms?.image || cat.image || null,
        brandImage: cms?.brandImage || null,
        brandTextColor: cms?.brandTextColor || 'white',
        description,
        brand,
        order: cms?.order ?? cat.order ?? 0,
      };
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
