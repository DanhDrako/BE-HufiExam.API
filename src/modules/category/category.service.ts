import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { Category } from 'src/entities/category.entity';
import { Connection, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { QueryGetCateDto } from './dto/query-get-cate.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CategoryService {
  private cateRepo: Repository<Category> = null;

  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
  ) {
    this.cateRepo = this.connection.getRepository(Category);
  }

  getRepo() {
    return this.cateRepo;
  }

  async findById(id: number) {
    return await this.cateRepo.findOne({ where: { id: id } });
  }

  async findByName(name: string) {
    return await this.cateRepo.createQueryBuilder('cate')
      .where('LOWER(cate.name) = LOWER(:name)', { name: name }).getOne();
  }

  async create(req: any, dto: CreateCategoryDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // unique name
    const find = await this.findByName(dto.name);
    if (find) {
      // remove image before
      if (dto.imageBanner && dto.imageBanner !== find.imageBanner) PublicModules.fun_removeFileIfExists(dto.imageBanner);
      task = PublicModules.fun_makeResError(null, Dics.NAME_FOUND);
      return task;
    }

    // save
    const newCate = plainToClass(Category, dto);
    const result = await this.cateRepo.save(newCate);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async findAll(req: any, query: QueryGetCateDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // defalut value;
    const isBlackMarket = query.isBlackMarket || false;
    const page = query.page || 1;
    const limit = query.limit || 100;

    const result = await this.cateRepo.createQueryBuilder('cate')
      .where('cate.isBlackMarket = :isBlackMarket', { isBlackMarket })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    task = PublicModules.fun_makeResListSucc(result);

    return task;
  }

  async findOne(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const cate = await this.findById(id);
    if (!cate) {
      task = PublicModules.fun_makeResNotFound(null, 'CATE');
      return task;
    }
    task = PublicModules.fun_makeResFoundSucc(cate);

    return task;
  }

  async update(req: any, id: number, dto: UpdateCategoryDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const cate = await this.findById(id);
    if (!cate) {
      task = PublicModules.fun_makeResNotFound(null, 'CATE');
      return task;
    }
    // remove image before
    if (dto.imageBanner && dto.imageBanner !== cate.imageBanner) PublicModules.fun_removeFileIfExists(cate.imageBanner);
    const newCate = this.cateRepo.merge(cate, dto);
    const result = await this.cateRepo.save(newCate);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }

  async remove(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const cate = await this.findById(id);
    if (!cate) {
      task = PublicModules.fun_makeResNotFound(null, 'CATE');
      return task;
    }
    const result = await this.cateRepo.softRemove(cate);
    PublicModules.fun_removeFileIfExists(cate.imageBanner);
    task = PublicModules.fun_makeResDeleteSucc('result');

    return task;
  }

  async findCateBlackMarket() {
    return await this.cateRepo.createQueryBuilder('cate')
      .where('LOWER(cate.name) like :name', { name: '%chợ đen%' })
      .getOne();
  }
}
