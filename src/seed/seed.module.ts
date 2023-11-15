import { Module } from '@nestjs/common';
import { ItemsModule } from './../items/items.module';
import { UsersModule } from './../users/users.module';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { ConfigModule } from '@nestjs/config';
import { ListItemModule } from './../list-item/list-item.module';
import { ListsModule } from './../lists/lists.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [ConfigModule, UsersModule, ItemsModule, ListItemModule, ListsModule]
})
export class SeedModule { }
