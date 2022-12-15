import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { TagName } from 'src/entities/tagname.entity';
import { Connection, Repository } from 'typeorm';
import { CreateTagNameDto } from './dto/create-tag-name.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { plainToClass } from 'class-transformer';
import { UpdateTagNameDto } from './dto/update-tag-name.dto';
import { QueryGetTagsDto } from './dto/query-get-tags.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TagNameService {
  private tagRepo: Repository<TagName> = null;

  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
  ) {
    this.tagRepo = this.connection.getRepository(TagName);
  }

  getRepo() {
    return this.tagRepo;
  }

  async findByName(name: string) {
    return await this.tagRepo.createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name: name }).getOne();
  }

  async findById(id: number) {
    return await this.tagRepo.findOne({ where: { id: id } });
  }

  async create(req: any, dto: CreateTagNameDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // unique name ?
    const find = await this.findByName(dto.name);
    if (find) {
      task = PublicModules.fun_makeResError(null, Dics.NAME_FOUND);
      return task;
    }

    // save
    const newTag = plainToClass(TagName, dto);
    const result = await this.tagRepo.save(newTag);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async delete(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'TAG');
      return task;
    }
    const result = await this.tagRepo.softRemove(find);
    task = PublicModules.fun_makeResDeleteSucc(result);

    return task;
  }

  async get(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'TAG');
      return task;
    }

    task = PublicModules.fun_makeResDeleteSucc(find);

    return task;
  }

  async edit(req: any, id: number, dto: UpdateTagNameDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'TAG');
      return task;
    }

    const newTag = this.tagRepo.merge(find, dto);
    const result = await this.tagRepo.save(newTag);
    task = PublicModules.fun_makeResDeleteSucc(result);

    return task;
  }

  async findAll(req: any, query: QueryGetTagsDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // defalut value;
    const isBlackMarket = query.isBlackMarket || false;
    const page = query.page || 1;
    const limit = query.limit || 100;

    const result = await this.tagRepo.createQueryBuilder('tags')
      .where('tags.isBlackMarket = :isBlackMarket', { isBlackMarket })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    task = PublicModules.fun_makeResListSucc(result);

    return task;
  }
}
