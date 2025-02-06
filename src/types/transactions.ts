import {ObjectId} from 'mongodb'

export default interface ITransactiion{
    id?: ObjectId;
    reference: string;
    transactionType: string;
    description: string;
    userId: ObjectId;
    email: string;
    points: number;
    type: string;
    status: string;
    metadata: object;
    updatedAt: Date;
    createdAt: Date;
}