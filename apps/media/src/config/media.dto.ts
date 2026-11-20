import { IsOptional, IsString} from 'class-validator'


export class uploadImageDto{

    @IsString()
    fileName: string;

    @IsString()
    mimeType: string;

    @IsString()
    base64: string;

    @IsString()
    uploadByUserId: string;

}

export class AttachToProductDto {
    
    @IsString()
    mediaId: string;

    @IsString()
    productId: string;

    @IsOptional()
    @IsString()
    attachedByUserId: string;


}