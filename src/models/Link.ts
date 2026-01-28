import {models, model, Schema} from 'mongoose'
import { ILink } from '@/types'

const customInputSchema = new Schema({
    label: { type: String, required: true },
    placeholder: { type: String, default: '' },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: true },
}, { _id: false });

const customPageSchema = new Schema({
    pageNumber: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    writeup: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    backgroundUrl: { type: String, default: '' },
    backgroundColor: { type: String, default: '#ffffff' },
    buttonText: { type: String, default: 'Continue' },
    buttonColor: { type: String, default: '#3b82f6' },
    inputs: [customInputSchema],
}, { _id: false });

const successPageSchema = new Schema({
    title: { type: String, default: 'Success!' },
    message: { type: String, default: 'Your submission has been received.' },
    buttonText: { type: String, default: 'Done' },
    buttonUrl: { type: String, default: '' },
}, { _id: false });

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
    },
    otpEnabled:{
        type: Boolean,
        default: false,
    },
    retry:{
        type: Number,
        default: 0,
    },
    // Custom link fields
    customPages: [customPageSchema],
    successPage: successPageSchema,
}, {
    timestamps: true
});

const Link = models.Link || model<ILink>('Link', linkSchema);

export default Link;