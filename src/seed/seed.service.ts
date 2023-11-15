import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Item } from './../items/entities/item.entity';
import { User } from './../users/entities/user.entity';
import { ListItem } from './../list-item/entities/list-item.entity';
import { List } from './../lists/entities/list.entity';

import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

import { UsersService } from './../users/users.service';
import { ItemsService } from './../items/items.service';
import { ListsService } from './../lists/lists.service';
import { ListItemService } from './../list-item/list-item.service';

@Injectable()
export class SeedService {
    private isProd: boolean
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemService: ListItemService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,
    ) {
        this.isProd = configService.get("STATE") === "prod"
    }
    async executeSeed() {
        if (this.isProd) throw new UnauthorizedException("No se puede ejecutar el seed en produccion")
        await this.deleteDatabase()//borro la bd
        const user = await this.loadUsers()//creo los usuarios
        await this.loadItems(user)//creo los items
        const list = await this.loadLists(user)//creo las listas
        const items = await this.itemsService.findAll(user, { limit: 10, offset: 0 }, {})
        await this.loadListItems(list, items)//creo los items de la listas

        return true
    }

    async deleteDatabase() {
        await this.listItemsRepository.createQueryBuilder().delete().where({}).execute()
        await this.listsRepository.createQueryBuilder().delete().where({}).execute()
        await this.itemsRepository.createQueryBuilder().delete().where({}).execute()
        await this.usersRepository.createQueryBuilder().delete().where({}).execute()
    }

    async loadUsers(): Promise<User> {
        const users = []
        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user))
        }
        return users[0]
    }


    async loadItems(user: User): Promise<void> {
        const itemsPromises = []
        for (const item of SEED_ITEMS) {
            itemsPromises.push(await this.itemsService.create(item, user))
        }
        await Promise.all(itemsPromises)
    }

    async loadLists(user: User): Promise<List> {
        const lists = []
        for (const list of SEED_LISTS) {
            lists.push(await this.listsService.create(list, user))
        }
        return lists[0]
    }

    async loadListItems(list: List, items: Item[]) {
        for (const item of items) {
            this.listItemService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            });
        }

    }
}
