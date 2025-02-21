import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "@/models/Link";
import { isValidUrl } from "@/lib/validation";

// GET single link
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    await connectToDatabase();
    const link = await Link.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE link
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, contestantName, linkName, linktype, writeup, image, bannerImage, retry, askForOtp } = body;


    // Input validation
    if(!linkName || !writeup || !image){
      return NextResponse.json({ error: "Link name and writeup are required" }, { status: 400 });
    }

    // Validate image
    if (!image.endsWith('.png') && !image.endsWith('.jpg') && !image.endsWith('.jpeg')) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    if(linktype === 'voting' || linktype === 'giveaway'){
      if (!bannerImage.endsWith('.png') && !bannerImage || !bannerImage.endsWith('.jpg') && !bannerImage || !bannerImage.endsWith('.jpeg')) {
        return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
      }
    }

    await connectToDatabase();
    
    // First verify the link belongs to the user
    const existingLink = await Link.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const updatedLink = await Link.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title || existingLink.title,
          contestantName: contestantName || existingLink.contestantName,
          linkName: linkName || existingLink.linkName,
          writeup: writeup || existingLink.writeup,
          image: image || existingLink.image,
          bannerImage: bannerImage || existingLink.bannerImage,
          retry: retry || 1,
          otpEnabled: askForOtp !== undefined ? askForOtp : existingLink.otpEnabled
        },
      },
      { new: true }
    );

    return NextResponse.json({ message: "Link updated successfully", data: updatedLink });
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE link
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    // First verify the link belongs to the user
    const existingLink = await Link.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await Link.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
