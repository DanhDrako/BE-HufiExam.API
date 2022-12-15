import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolerUser } from 'src/common/Enums';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryGetCateDto } from './dto/query-get-cate.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
@ApiTags('CATEGORY')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Create new category role [ ADMIN ]' })
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  create(@Req() req: any, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(req, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list category' })
  findAll(@Req() req: any, @Query() query: QueryGetCateDto) {
    return this.categoryService.findAll(req, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id role [ ADMIN ]' })
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.categoryService.findOne(req, +id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category role [ ADMIN ]' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  update(@Req() req: any, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(req, +id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category role [ ADMIN ]' })
  @UseGuards(AuthGuard())
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  remove(@Req() req: any, @Param('id') id: string) {
    return this.categoryService.remove(req, +id);
  }
}
