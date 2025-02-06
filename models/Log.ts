import {models, model, Schema} from 'mongoose'
import { ILog } from '../src/types'

const logSchema = new Schema<ILog>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    log: {
        type: Object,
        required: [true, 'Log is required'],
    }
}, {
    timestamps: true
});

logSchema.index({userId: 1}, {unique: true})

const Log = models.Log || model<ILog>('Log', logSchema);

export default Log;