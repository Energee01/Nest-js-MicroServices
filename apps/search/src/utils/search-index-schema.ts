import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose';

export type  SearchDocument = HydratedDocument<Search>


@Schema({timestamps: true})
export class Search {

    @Prop({required: true, unique : true, index : true})
    productId: string;

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    normalizedText : string;

    @Prop({required: true, enum : ['AVAILABLE', 'UNAVAILABLE']})
    status: 'AVAILABLE' | 'UNAVAILABLE';

     @Prop({required: true})
    price: number
}

export const SearchSchema = SchemaFactory.createForClass(Search);