import calculateExpiresAt from "@/lib/calculateExpiresAt";
import calculatePrice from "@/lib/calculatePrice";
import connectDB from "@/lib/db";
import Link from "@/models/Link";
import User from "@/models/User";
import { ILink } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import shortid from 'shortid';


export async function POST(request: NextRequest){
    try{
        const {linkName, title, contestantName, writeup, duration, platforms,  askForOtp, image, bannerImage, type} = await request.json();

        // Validate image URL
        if (!image || typeof image !== 'string') {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        try {
            const imageUrl = new URL(image);
            const isValidImageExtension = /\.(jpg|jpeg|png)$/i.test(imageUrl.pathname);
            if (!isValidImageExtension) {
                return NextResponse.json({ error: 'Image URL must end with .jpg, .jpeg, or .png' }, { status: 400 });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
        }

        try {
            if(bannerImage){
                const bannerImageUrl = new URL(bannerImage);
                const isValidBannerImageExtension = /\.(jpg|jpeg|png)$/i.test(bannerImageUrl.pathname);
                if (!isValidBannerImageExtension) {
                    return NextResponse.json({ error: 'Banner image URL must end with .jpg, .jpeg, or .png' }, { status: 400 });
                }
            }
        } catch (error) {
            return NextResponse.json({ error: 'Invalid banner image URL format' }, { status: 400 });
        }

        // verify session
        const session = await getServerSession();
        if(!session?.user.email){
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        // check type and validate based on type
        let validationErrors = [];
        if(!duration || !type || !platforms){
            validationErrors.push('All fields are required');
            return NextResponse.json({error: validationErrors}, {status: 400});
        }
        if(platforms.length === 0){
            validationErrors.push('Please select at least one platform');
            return NextResponse.json({error: validationErrors}, {status: 400});
        }
        if(!platforms.includes('facebook') && !platforms.includes('instagram') && !platforms.includes('tiktok')){
            validationErrors.push('Please select at least one social media platform');
            return NextResponse.json({error: validationErrors}, {status: 400});
        }
        if(type === 'giveaway' || type === 'custom'){
            if(!linkName || !title || !writeup){
                validationErrors.push('All fields are required');
            }
        }
        if(type === 'voting'){
            if(!linkName || !contestantName || !writeup){
                validationErrors.push('All fields are required');
            }
        }
        if(validationErrors.length > 0){
            return NextResponse.json({error: validationErrors}, {status: 400})
        }

        // calculate price
        const price = calculatePrice(duration, platforms);
        const expiresAt = calculateExpiresAt(duration);
        // check points balance of user
        await connectDB();
        const user = await User.findOne({email: session.user.email});
        if(!user){
            return NextResponse.json({error:'Something went wrong'}, {status: 400});
        }

        if(!user.telegramId){
            return NextResponse.json({error: 'Please connect your Telegram account'}, {status: 400})
        }

        if(user.points < Number(price)){
            return NextResponse.json({error: 'Not enough credits'}, {status: 400})
        }

        // create link
        // generate short link id
        const linkId = shortid.generate();
        const newLink = new Link<ILink>({
            userId: user._id,
            linkId,
            title: title || '',
            contestantName: contestantName || '',
            writeup: writeup || '',
            image: image || '',
            bannerImage: bannerImage || '',
            linkName: linkName || '',
            linkType: type,
            socialMedia: platforms,
            otpEnabled: askForOtp,
            expiresAt
        });
        await newLink.save();

        user.points -= Number(price);
        await user.save();

        return NextResponse.json({success: 'Link created successfully', link: newLink}, {status: 200});
    }catch(error:any){
        return NextResponse.json({error: error.message}, {status: 500})
    }
}