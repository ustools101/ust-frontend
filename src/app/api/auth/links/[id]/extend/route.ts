import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import { ObjectId } from "mongodb";
import User from "@/models/User";
import Link from "@/models/Link";
import calculatePrice from "@/lib/calculatePrice";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try{
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const {duration} = await request.json();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    if(!duration || isNaN(duration)){
      return NextResponse.json({error: 'Duration is required' }, { status: 400 });
    }

    await connectToDatabase();

    const link = await Link.findById(id);

    if(!link){
      return NextResponse.json({error: 'Link not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);

    if(!user){
      return NextResponse.json({error: 'User not found' }, { status: 404 });
    }

    const platformPrice = [4000, 6500, 9000];

    const price = duration * platformPrice[link.socialMedia.length-1];

    if(user.points < price){
      return NextResponse.json({error: 'Insufficient points' }, { status: 400 });
    }

    // check if link has expired
    let newExpiresAt;
    if(link.expiresAt < Date.now()){
      const dateNow = new Date();
      newExpiresAt = new Date(dateNow.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    }else{
      const expiresAt = new Date(link.expiresAt);
      newExpiresAt= new Date(expiresAt.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    }
    await Link.findByIdAndUpdate(id, {expiresAt: newExpiresAt});
    user.points -= price;
    await user.save();
    return NextResponse.json({ message: "Link extended successfully" }, { status: 200 });
  }catch(error:any){
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
