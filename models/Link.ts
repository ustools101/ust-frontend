import {models, model, Schema, ObjectId} from 'mongoose'
import { ILink } from '../src/types'

const linkSchema = new Schema<ILink>({
    userId: {
        type: String,
        ref: 'User',
        unique: false,
        required: [true, 'User is required'],
    },
    linkId: {
        type: String,
        required: [true, 'Link is required'],
    },
    linkName: {
        type: String,
        required: [true, 'Link Name is required']
    },
    title: {
        type: String,
        required: false,
    },
    contestantName: {
        type: String,
        required: false
    },
    bannerImage: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    linkType: {
        type: String,
        required: [true, 'Link type is required'],
    },
    writeup: {
        type: String,
        required: [true, 'Writeup is required'],
    },
    socialMedia: {
        type: String,
        required: [true, 'Social media is required'],
    },
    otpEnabled: {
        type: Boolean,
        required: false,
        default: true
    }
}, {
    timestamps: true
});

// Create a non-unique index on userId for better query performance
linkSchema.index({ userId: 1 }, { unique: false });

const Link = models.Link || model<ILink>('Link', linkSchema);

export default Link;