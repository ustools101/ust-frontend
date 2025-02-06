import {ObjectId} from "mongodb";

export default interface IUser {
    id: ObjectId;
    username: string;
    email: string;
    password: string;
    points: number;
    telegramId: number;
    enableTelegramNotification: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}