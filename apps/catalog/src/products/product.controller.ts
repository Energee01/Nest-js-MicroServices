import { Controller } from "@nestjs/common";
import { ProductService } from "./products.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductDto, DeleteByIdDto, GetProductByIdDto, UpdateByIdDto } from "./products.dto";



@Controller()
export class ProductController{
    constructor(
        private readonly productsService: ProductService
    ){}

    @MessagePattern('catalog.create')
    create(@Payload()payload: CreateProductDto){
        return this.productsService.createNewProduct(payload)
    }

    @MessagePattern('catalog.list')
    list(){
        return this.productsService.listProducts();
    }

    @MessagePattern('catalog.getById')
    getbyId(@Payload() payload: GetProductByIdDto){
        return this.productsService.getProduct(payload)
    }

    @MessagePattern('catalog.updateById')
    update(@Payload() payload: UpdateByIdDto){
        return this.productsService.updateProduct(payload.id, payload.data);
    }

    @MessagePattern('catalog.deleteById')
    remove(@Payload() payload: DeleteByIdDto){
        return this.productsService.deleteProduct(payload);
    }

}