import { User } from "~/entity";
import { UserStatus } from "../enums/common.enum";



export interface ServiceInterface {
    id: string;
    price: string;
    serviceName: string;
    type: string;
    serviceStatus: UserStatus;
    description?: string;
    image?: string;
    isActive: boolean;
    
    users: User[];

    createdAt: Date;
    updatedAt: Date;
}

export interface GenerationInterface {
    price: string;
    serviceName: string;
    type: string;
    serviceStatus: UserStatus;
    description?: string;
    image?: string;
    isActive?: boolean;
}