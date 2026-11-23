import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';



export class ProductCreatedDto {

    @IsString()
    productId: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsIn(['AVAILABLE', 'UNAVAILABLE'])
    status: 'AVAILABLE' | 'UNAVAILABLE';

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    createdByClerkUserId?: string
    
}