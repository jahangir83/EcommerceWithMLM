import { User } from "~/entity";
import { UserStatus } from "../enums/common.enum";



export interface ServiceInterface {
    id: string;
    price: string;
    serviceName: string;
    type: 'online'|'offline'|'hybrid';
    serviceStatus: UserStatus;
    description?: string;
    image?: string;
    isActive: boolean;
    generationPrice?: generationPriceInterface[];
    isGenerationPriceActive?: boolean;
    users: User[];

    createdAt: Date;
    updatedAt: Date;
}

export interface generationPriceInterface {
    generation: number;
    price: number;
    content: string;
}