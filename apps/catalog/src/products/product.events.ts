

//events will be public contracts between services
//small + stable


export type ProductStatus = 'UNAVAILABLE' | 'AVAILABLE'

export type ProductCreatedEvent = {

    productId : string;
    name: string;
    description: string;
    status: ProductStatus;
    price: number;
    imageUrl?: string;
    createdByClerkUserId?: string;
};