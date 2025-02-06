import { ObjectId } from "mongodb";

type SocialOptions = "facebook" | "twitter" | "instagram" | 'gmail' | "youtube" | "linkedin" | "tiktok";
type SociaMedia = Array<SocialOptions>;
type LinkType = "Voting" | "Giveaway" | "Custom";

export default interface ILink {
    _id?: ObjectId;
    userId: String;
    linkId: String;
    linkType: LinkType;
    linkName: String;
    contestantName?: String;
    title?: string;
    writeup: String;
    socialMedia?: SociaMedia;
    expiresAt: Date;
    image: string;
    bannerImage?: string;
    otpEnabled?: Boolean;
    updatedAt?: Date;
    createdAt?: Date;   
}