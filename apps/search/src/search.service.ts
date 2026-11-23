import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Search, SearchDocument } from './utils/search-index-schema';

@Injectable()
export class SearchService {


  constructor(
    @InjectModel(Search.name) private readonly searchModel : Model<SearchDocument>
  ){

  }

  normalizedText(input: {name : string; description: string}){
    return `${input.name} ${input.description}`.toLowerCase()
  }

  async upsertFromCatalogEvent(input : {
    productId: string;
    name: string;
    description: string;
    status: 'AVAILABLE' | 'UNAVAILABLE';
    price: number
  }){
      const normalizedText = this.normalizedText({
        name: input.name,
        description: input.description
      })

      await this.searchModel.findOneAndUpdate(
        {productId: input.productId},
        {
          $set : {
            name: input.name,
            normalizedText,
            status: input.status,
            price: input.price
          }
        },
        {
          returnDocument: 'after',
          upsert: true,
          setDefaultsOnInsert: true
        }
      )
  }


  async query(input: { q: string; limit?: number}){
    const q = (input.q ?? "").trim().toLowerCase();

    if(!q){
      return []
    }

    const limit = Math.min((Math.max(input.limit ?? 10, 1), 50));

    const regex = new RegExp(q.replace(/[.*+?^{}()|[\]\\]/g, '\\$&'), 'i');

    return this.searchModel.find({normalizedText : {$regex : regex}})
    .sort({createdAt : -1})
    .limit(limit).exec();
  }


  ping(){
    return {
      ok: true,
      service: 'search',
      now: new Date().toISOString()
    }
  }
}
