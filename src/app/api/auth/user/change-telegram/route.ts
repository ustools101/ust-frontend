import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../[...nextauth]/route";
import User from "@/models/User";
import connectToDatabase from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { telegramId } = await request.json();

    // Validate telegramId
    if (!telegramId || typeof telegramId !== 'number' || telegramId <= 0) {
      return NextResponse.json({ error: "Invalid Telegram ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Update user's telegram ID
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        telegramId,
        enableTelegramNotification: true // Enable notifications by default when connecting
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Telegram ID updated successfully" });
  } catch (error) {
    console.error("Error updating Telegram ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}