import {models, model, Schema} from 'mongoose'
import { IUser } from '@/types'

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    points: {
        type: Number,
        default: 0,
    },
    telegramId: {
        type: Number,
    },
    enableTelegramNotification: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        default: 'user',
    },
}, {
    timestamps: true
});


const User = models.User || model<IUser>('User', userSchema);

export default User;