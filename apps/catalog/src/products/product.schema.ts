import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";




export type ProductDocument = HydratedDocument<Product>
//create type first

export type ProductStatus = 'UNAVAILABLE' | 'AVAILABLE'

//create schema next
@Schema({timestamps : true})
export class Product {

    @Prop({required : true})
    name : string;

    @Prop({required : true})
    description : string;
    
    @Prop({required : true})
    price : number;

    @Prop({ type: String, required : true, enum : ['UNAVAILABLE', 'AVAILABLE'], default : 'UNAVAILABLE'})
    status : ProductStatus;

    @Prop({required : false})
    imageUrl? : string;

    @Prop({required : true})
    createdByClerkUserId?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product)