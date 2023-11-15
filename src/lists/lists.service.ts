import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './../items/entities/item.entity';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { User } from './../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from './../common/dto/args';

@Injectable()
export class ListsService {

  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>
  ) { }

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listsRepository.create({ ...createListInput, user })
    await this.listsRepository.save(newList)
    return newList
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<List[]> {
    const { limit, offset } = paginationArgs
    const { search } = searchArgs

    const queryBuilder = this.listsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere(`LOWER(name) like:name`, { name: `%${search.toLowerCase()}%` })
    }
    return queryBuilder.getMany()
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listsRepository.findOneBy({
      id, user: { id: user.id }
    })
    if (!list) throw new NotFoundException(`Lista con el id:${id} no encontrado`)
    return list
  }

  async update(id: string, updateListInput: UpdateListInput, user: User): Promise<List> {
    await this.findOne(id, user)
    const list = await this.listsRepository.preload({ ...updateListInput, user })
    if (!list) throw new NotFoundException(`Lista con el id:${id} no encontrado`)
    return this.listsRepository.save(list);
  }

  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne(id, user)
    await this.listsRepository.remove(list)
    return { ...list, id };
  }

  async listsCountByUser(user: User): Promise<number> {
    return this.listsRepository.count({
      where: { user: { id: user.id } }
    })
  }
}