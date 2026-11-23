import { Injectable } from "@nestjs/common";
import { isValidObjectId, Model } from "mongoose";
import { Product, ProductDocument, ProductStatus } from "./product.schema";
import { InjectModel } from "@nestjs/mongoose";
import { rpcBadRequest, rpcNotFound } from "@app/rpc";
import { UpdateProductDto} from "./products.dto";
import { ProductEventsPublisher } from "../events/product-events-publisher";




@Injectable()
export class ProductService {
    
    constructor(
        @InjectModel(Product.name) private readonly productModel : Model<ProductDocument>,

        private readonly events: ProductEventsPublisher
    ){}

   async createNewProduct(input: {
    name: string;
    description: string;
    price: number;
    status?: ProductStatus;
    imageUrl?:string;
    createdByClerkUserId: string;

   }){

        if(!input.name || !input.description){
            rpcBadRequest('name and description are required')
        }

        if(typeof input.price !== 'number' || Number.isNaN(input.price) ||
        input.price < 0 
        ){
            rpcBadRequest('Price must be a valid number >=0')
        }

        if(input.status && input.status !== 'UNAVAILABLE' && input.status !== 'AVAILABLE'){
            rpcBadRequest(`Status must be either Available or unavailable`);
        }

        const newlyCreatedProduct = await this.productModel.create({
            name: input.name,
            description: input.description,
            price :  input.price,
            status :  input.status ?? 'UNAVAILABLE',
            imageUrl : input.imageUrl?? '',
            createdByClerkUserId: input.createdByClerkUserId

        })

        //emit that event after the db success


        await this.events.productCreated({
            productId : String(newlyCreatedProduct._id),
            name: newlyCreatedProduct.name,
            description: newlyCreatedProduct.description,
            status: newlyCreatedProduct.status,
            price: newlyCreatedProduct.price,
            imageUrl: newlyCreatedProduct.imageUrl,
            createdByClerkUserId: newlyCreatedProduct.createdByClerkUserId


        })

        return newlyCreatedProduct
    }

    async listProducts(){
        return await this.productModel.find().sort({ createdAt: -1}).exec()
    }

    async getProduct(input: {id : string}){
        if(!isValidObjectId(input.id)){
            rpcBadRequest('Invalid product ID')
        }

        const product = await this.productModel.findById(input.id).exec()

        if(!product){
            rpcNotFound('Product is not found');
        }

        return product
    }

    async updateProduct(id : string, data: UpdateProductDto){
         if(!isValidObjectId(id)){
            rpcBadRequest('Invalid product ID');
        }

        if(Object.keys(data ?? {}).length === 0){
            rpcBadRequest('Nothing to update')
        }

        const updated = await this.productModel.findByIdAndUpdate(
            id,
            {$set: data },
            { returnDocument: 'after', runValidators: true}
            );

            if(!updated){
                rpcNotFound('Product not found');
            }

            return updated;
    }

    async deleteProduct(input:{id: string}){
        if(!isValidObjectId(input.id)){
            rpcBadRequest('Invalid Product ID');
        }

        const removeProduct = await this.productModel.findByIdAndDelete(input.id).exec()

        if(!removeProduct){
            rpcNotFound('Product not found');
        }

        return removeProduct
    }
}