import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import connectToDatabase from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify the payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${body.reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get user ID and credits from metadata
    const { userId, credits } = data.data.metadata;

    await connectToDatabase();

    // Find and update transaction status
    const transaction = await Transaction.findOneAndUpdate(
      { reference: body.reference },
      { 
        status: 'success',
        metadata: {
          ...data.data,
          verifiedAt: new Date()
        }
      },
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update user's credits
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: Number(credits) } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Payment verified and credits added successfully",
      credits: user.points,
      transaction: transaction
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

// Handle Paystack webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  
  if (!reference) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  try {
    // Verify the payment
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    await connectToDatabase();

    // Update transaction status based on payment status
    if (data.status && data.data.status === "success") {
      await Transaction.findOneAndUpdate(
        { reference },
        { 
          status: 'success',
          metadata: {
            ...data.data,
            verifiedAt: new Date()
          }
        }
      );


      // Update user's credits
      const { userId, credits } = data.data.metadata;
      await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: credits } }
      );

      return NextResponse.redirect(new URL('/dashboard?payment=success', request.url));
    } else {
      await Transaction.findOneAndUpdate(
        { reference },
        { 
          status: 'failed',
          metadata: {
            ...data.data,
            failedAt: new Date()
          }
        }
      );
      return NextResponse.redirect(new URL('/dashboard?payment=failed', request.url));
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(new URL('/dashboard?payment=error', request.url));
  }
}
