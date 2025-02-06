import { ObjectId } from 'mongodb';

export default interface ILog {
    id: ObjectId;
    userId: ObjectId;
    log: Object;
    updatedAt: Date;
    createdAt: Date;
}