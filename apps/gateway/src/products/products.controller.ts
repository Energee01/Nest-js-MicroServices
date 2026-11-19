import { Body,
         Controller, 
         Delete, 
         Get, 
         Inject, 
         Param, 
         Patch, 
         Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttp } from "@app/rpc";
import { firstValueFrom } from "rxjs";
import { AdminOnly } from "../auth/admin.decorator";
import { Public } from "../auth/public.decorator";


type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    status: 'UNAVAILABLE' | 'AVAILABLE';
    imageUrl: string | undefined;
    createdByClerkUserId : string | undefined;
}

@Controller()
export class ProductsHttpController{
    constructor(

        //gateway talks to catalog via RMQ client
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy
    ){}

    @Post('products')
    @AdminOnly()
    async createProduct(
        @CurrentUser() user: UserContext,
        @Body()
        body: {
            name: string;
            description: string;
            price: number;
            status?: string;
            imageUrl?: string;

        }
    ){

        //already handling errors in productservice(catalog)
        let product : Product

        const payload = {
            //this is gotten from the products dto
            name : body.name,
            description: body.description,
            price: Number(body.price),
            status: body.status,
            imageUrl: '',
            createdByClerkUserId: user.clerkUserId
        }


        //RMQ request and response pattern

        try{
            product = await firstValueFrom(
                this.catalogClient.send('catalog.create',payload)
            )
        } catch(err){
            mapRpcErrorToHttp(err)
        }

        return product;
    }

    @Get('products')
    @Public()
    async listProducts(){
        try{
            return await firstValueFrom(this.catalogClient.send('catalog.list', {}))

        }catch(err){
            mapRpcErrorToHttp(err)
        }
    }

    @Get('products/:id')
    @Public()
    async getProduct(@Param('id') id: string){
        
        try{
            return await firstValueFrom(this.catalogClient.send('catalog.getById', {id}))
        }catch(err){
            mapRpcErrorToHttp(err)
        }
    }

   @Patch('products/:id')
   @AdminOnly()
   async updateProduct(
    @Param('id') id: string, 
    @Body() body:{
        name?: string,
        description?: string,
        price?: number,
        status?: string,
        imageUrl?: string,
    }
   ){
    //only send the fields the client actually updated
    const data: Record<string, unknown>={}

    if(body.name !==undefined) data.name = body.name;
    if(body.description !==undefined) data.description = body.description;
    if(body.price !==undefined) data.price = body.price;
    if(body.status !==undefined) data.status = body.status;
    if(body.imageUrl !==undefined) data.imageUrl= body.imageUrl;
   
        try{
            return await firstValueFrom(
                this.catalogClient.send('catalog.updateById', {id, data}))
        }catch(err){
            mapRpcErrorToHttp(err)
        }
    
    }

    @Delete('products/:id')
    @AdminOnly()
    async deleteProduct(
        @Param('id') id: string
    ){
        try{
            return await firstValueFrom(this.catalogClient.send('catalog.deleteById', {id})) 

        }catch(err){
            mapRpcErrorToHttp(err)
        }
    }


}