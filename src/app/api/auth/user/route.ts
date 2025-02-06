import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";
import User from "@/models/User";
import Link from "@/models/Link";

export async function GET(){
    try{
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error:'unauthorized'}, {status: 401});
        }
        const user = await User.findById(session.user.id);
        const links = await Link.find({userId: user._id}).sort({createdAt: -1});
        return NextResponse.json({user, links}, {status:200});
    }catch(error){
        return NextResponse.json({error:'Internal server error'}, {status: 500});
    }
}