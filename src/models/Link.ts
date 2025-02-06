import {models, model, Schema} from 'mongoose'
import { ILink } from '@/types'

const linkSchema = new Schema<ILink>({
    userId: {
        type: String,
        unique: false,
        required: [true, 'User is required'],
    },
    linkId: {
        type: String,
        required: [true, 'Link is required'],
    },
    linkName: {
        type: String,
        required: [true, 'Link name is required'],
    },
    linkType: {
        type: String,
        required: [true, 'Link type is required'],
    },
    title: {
        type: String,
    },
    writeup: {
        type: String,
        required: [true, 'Writeup is required'],
    },
    contestantName: {
        type: String,
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required'],
    },
    image: {
        type: String,
    },
    bannerImage:{
        type: String,
    },
    socialMedia: {
        type: Schema.Types.Mixed,
        required: [true, 'Social media is required'],
    }
}, {
    timestamps: true
});

const Link = models.Link || model<ILink>('Link', linkSchema);

export default Link;