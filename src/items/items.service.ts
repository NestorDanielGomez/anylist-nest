import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/imputs';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>
  ) { }

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput)
    await this.itemsRepository.save(newItem)
    return newItem
  }

  async findAll(): Promise<Item[]> {
    const allItems = this.itemsRepository.find()
    return allItems;
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id })
    if (!item) throw new NotFoundException(`Producto con el id:${id} no encontrado`)
    return item
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemsRepository.preload(updateItemInput)
    if (!item) throw new NotFoundException(`Producto con el id:${id} no encontrado`)
    return this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    const item = await this.findOne(id)
    await this.itemsRepository.remove(item)

    return { ...item, id };
  }
}
