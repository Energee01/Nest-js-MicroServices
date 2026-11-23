import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// defined locally so the gateway doesn't import the catalog's mongoose schema
export const PRODUCT_STATUSES = ['UNAVAILABLE', 'AVAILABLE'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export class CreateProductBodyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  // multipart values arrive as strings, so convert before validating
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;
}