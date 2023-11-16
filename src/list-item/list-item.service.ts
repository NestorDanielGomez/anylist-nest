import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationArgs, SearchArgs } from './../common/dto/args';

import { ListItem } from './entities/list-item.entity';
import { List } from './../lists/entities/list.entity';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,

  ) { }

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {

    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId }
    });

    await this.listItemsRepository.save(newListItem);

    return this.findOne(newListItem.id);
  }

  async findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem') // Nombre para las relaciones
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });
    if (search) { queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` }); }
    return queryBuilder.getMany();
  }

  async countListItemsByList(list: List): Promise<Number> {
    return this.listItemsRepository.count({ where: { list: { id: list.id } } })
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({ id });
    if (!listItem) throw new NotFoundException(`listItem con el id: ${id} no encontrada`);
    return listItem;
  }

  async update(
    id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {

    const { id: listItemId, listId, itemId, ...rest } = updateListItemInput;
    const queryBuilder = this.listItemsRepository.createQueryBuilder()
      .update()
      .set(rest)
      .where('id = :id', { id });

    if (listId) queryBuilder.set({ list: { id: listId } });
    if (itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();

    return this.findOne(id);

  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}