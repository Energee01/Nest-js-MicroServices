import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Search, SearchSchema } from './utils/search-index-schema';
import {ConfigModule} from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI_SEARCH as string),

    MongooseModule.forFeature([
      {
        name: Search.name,
        schema: SearchSchema,
      }
    ])
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
