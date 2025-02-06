import {models, model, Schema} from 'mongoose'
import { ILog } from '@/types'

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


const Log = models.Log || model<ILog>('Log', logSchema);

export default Log;