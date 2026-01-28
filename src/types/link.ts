import { ObjectId } from "mongodb";

type SocialOptions = "facebook" | "twitter" | "instagram" | 'gmail' | "youtube" | "linkedin" | "tiktok";
type SociaMedia = Array<SocialOptions>;
type LinkType = "Voting" | "Giveaway" | "Custom" | "scratch";

interface CustomInput {
    label: string;
    placeholder: string;
    type: string;
    required: boolean;
}

interface CustomPage {
    pageNumber: number;
    title: string;
    subtitle: string;
    writeup: string;
    logoUrl: string;
    backgroundUrl: string;
    backgroundColor: string;
    buttonText: string;
    buttonColor: string;
    inputs: CustomInput[];
}

interface SuccessPage {
    title: string;
    message: string;
    buttonText: string;
    buttonUrl: string;
}

export default interface ILink {
    _id?: ObjectId;
    userId: String;
    linkId: String;
    linkType: LinkType;
    linkName: String;
    contestantName?: String;
    title?: String;
    writeup?: String;
    socialMedia?: SociaMedia;
    expiresAt: Date;
    image?: String;
    bannerImage?: String;
    otpEnabled?: Boolean;
    retry?: Number;
    customPages?: CustomPage[];
    successPage?: SuccessPage;
    updatedAt?: Date;
    createdAt?: Date;   
}


