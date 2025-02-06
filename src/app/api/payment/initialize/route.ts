import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Transaction from "@/models/Transaction";
import connectToDatabase from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, email } = await request.json();

    // Validate amount
    if (!amount || amount < 1000 || amount > 1000000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount * 100, // Convert to kobo (Paystack uses the smallest currency unit)
        callback_url: `${process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST}/api/payment/verify`,
        metadata: {
          userId: session.user.id,
          credits: amount,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    // Create a pending transaction
    await connectToDatabase();
    
    const transaction = await Transaction.create({
      reference: data.data.reference,
      transactionType: 'purchase',
      description: `Purchase of ${amount.toLocaleString()} credits`,
      userId: session.user.id,
      email: email,
      points: amount,
      type: 'credit_purchase',
      status: 'pending',
      metadata: {
        paystackReference: data.data.reference,
        amount: amount * 100,
        credits: amount
      }
    });

    return NextResponse.json({
      ...data.data,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
