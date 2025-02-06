import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import Transaction from "@/models/Transaction";
import connectToDatabase from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const status = searchParams.get('status');

    // Validate status if provided
    const validStatuses = ['pending', 'success', 'failed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    // Build query with type safety
    const query: Record<string, any> = { 
      userId: session.user.id 
    };
    
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Get transactions with pagination and select only necessary fields
    const transactions = await Transaction.find(query, {
      _id: 1,
      transactionType: 1,
      type: 1,
      points: 1,
      description: 1,
      status: 1,
      createdAt: 1
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects for better performance

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
