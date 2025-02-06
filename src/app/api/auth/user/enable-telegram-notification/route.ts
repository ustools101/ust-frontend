import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../[...nextauth]/route";
import User from "@/models/User";

export async function POST(request: NextRequest){
    try{
       const session = await getServerSession(authOptions);
       if(!session){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }
       const user = await User.findById(session.user.id);
       if(!user){
        return NextResponse.json({ error: "User not found" }, { status: 404 });
       }
       const { enableTelegramNotification } = await request.json();
       user.enableTelegramNotification = enableTelegramNotification;
       await user.save();
       return NextResponse.json({ success: true });

    }catch(error:any){
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}