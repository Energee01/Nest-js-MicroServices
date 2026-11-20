import { IsDefined, 
        IsNumber, 
        IsOptional,
        IsString, 
        Min, 
        ValidateNested } from "class-validator";
import type { ProductStatus } from "./product.schema";
import { PartialType} from '@nestjs/mapped-types';
import { Type } from "class-transformer";



export class CreateProductDto{
    @IsString()
    name: string;

    @IsString()
    description : string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsString()
    status?: ProductStatus;

    @IsOptional()
    @IsString()
    imageUrl? : string;

    @IsString()
    createdByClerkUserId: string;
}

export class GetProductByIdDto{
    @IsString()
    id: string;
}


export class UpdateProductDto extends PartialType(CreateProductDto) {}



export class UpdateByIdDto {
    @IsString()
    id: string;

    @IsDefined()
    @ValidateNested()
    @Type(()=> UpdateProductDto)
    data: UpdateProductDto;
}

export class DeleteByIdDto {
    @IsString()
    id: string;
}

