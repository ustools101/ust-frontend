import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../[...nextauth]/route";
import User from "@/models/User";
import WelcomeBonus from "@/models/WelcomeBonus";
import connectToDatabase from "@/lib/db";

const WELCOME_BONUS_AMOUNT = 2000;

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
    
    // check if a user already has it
    const idExists = await User.findOne({telegramId});
    if(idExists){
      return  NextResponse.json({ error: "Someone is already using this ID" }, { status: 400 });
    }

    // Check if this telegramId has already claimed welcome bonus
    const existingBonus = await WelcomeBonus.findOne({ telegramId });
    const isEligibleForBonus = !existingBonus;

    // Update user's telegram ID and add bonus if eligible
    const updateData: { telegramId: number; enableTelegramNotification: boolean; $inc?: { points: number } } = {
      telegramId,
      enableTelegramNotification: true,
    };

    let user;
    if (isEligibleForBonus) {
      // Add welcome bonus to user's points
      user = await User.findByIdAndUpdate(
        session.user.id,
        { 
          telegramId,
          enableTelegramNotification: true,
          $inc: { points: WELCOME_BONUS_AMOUNT }
        },
        { new: true }
      );

      // Record the bonus claim to prevent future abuse
      if (user) {
        await WelcomeBonus.create({
          telegramId,
          userId: user._id,
          amount: WELCOME_BONUS_AMOUNT,
        });
      }
    } else {
      // Just update telegram ID without bonus
      user = await User.findByIdAndUpdate(
        session.user.id,
        { 
          telegramId,
          enableTelegramNotification: true
        },
        { new: true }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Telegram ID updated successfully",
      welcomeBonusAwarded: isEligibleForBonus,
      bonusAmount: isEligibleForBonus ? WELCOME_BONUS_AMOUNT : 0,
      newBalance: user.points,
    });
  } catch (error) {
    console.error("Error updating Telegram ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}