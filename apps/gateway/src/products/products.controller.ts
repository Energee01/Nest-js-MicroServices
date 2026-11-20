import { Body,
         Controller, 
         Delete, 
         Get, 
         Inject, 
         Param, 
         Patch, 
         Post, 
         UploadedFile, 
         UseInterceptors} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttp } from "@app/rpc";
import { firstValueFrom} from "rxjs";
import { AdminOnly } from "../auth/admin.decorator";
import { Public } from "../auth/public.decorator";
import { FileInterceptor } from '@nestjs/platform-express';



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
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,

        @Inject('MEDIA_CLIENT') private readonly mediaClient:  ClientProxy
    ){}

    @Post('products')
    @AdminOnly()
    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                fileSize : 5 * 1024 * 1024
            }
        })
    )
    async createProduct(
        @CurrentUser() user: UserContext,
        @UploadedFile() file: Express.Multer.File | undefined,
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
        let imageUrl: string | undefined = undefined;
        let mediaId: string | undefined = undefined;

        if(file){
            const base64 = file.buffer.toString('base64');

            try{
                const uploadResult = await firstValueFrom(
                    this.mediaClient.send('media.uploadProductImage', {
                        fileName: file.originalname,
                        mimeType: file.mimetype,
                        base64,
                        uploadByUserId: user.clerkUserId
                    })
                );

                imageUrl = uploadResult.url;
                mediaId= uploadResult.mediaId;
            }catch (err){
                mapRpcErrorToHttp(err)
            }
        }
        let product : Product

        const payload = {
            //this is gotten from the products dto
            name : body.name,
            description: body.description,
            price: Number(body.price),
            status: body.status,
            imageUrl,
            createdByClerkUserId: user.clerkUserId
        }        //RMQ request and response pattern
        try{
            product = await firstValueFrom(
                this.catalogClient.send('catalog.create',payload)
            )
        } catch(err){
            mapRpcErrorToHttp(err)
        }

        if(mediaId){
            try{

                await firstValueFrom(
                    this.mediaClient.send('media.attachImage', {
                        mediaId, 
                        productId:  String(product._id), 
                        attachedByUserId: user.clerkUserId,
                    })
                )
            }catch(err){
                mapRpcErrorToHttp(err)
            }
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