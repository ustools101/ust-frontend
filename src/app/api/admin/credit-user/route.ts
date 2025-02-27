import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { IUser } from "@/types";

// Rate limiting map
const requestMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const requestData = requestMap.get(ip);

    if (!requestData) {
        requestMap.set(ip, { count: 1, timestamp: now });
        return false;
    }

    if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
        requestMap.set(ip, { count: 1, timestamp: now });
        return false;
    }

    if (requestData.count >= MAX_REQUESTS) {
        return true;
    }

    requestData.count++;
    return false;
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(ip)) {
            return new NextResponse(
                JSON.stringify({ error: "Too many requests" }),
                { 
                    status: 429,
                    headers: {
                        'Retry-After': '60'
                    }
                }
            );
        }

        const session = await getServerSession();
        
        if (!session?.user?.email) {
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401 }
            );
        }

        await connectDB();
        
        // Check if user is admin
        const adminUser = await User.findOne<IUser>({ email: session.user.email }).select('role').lean();
        if (!adminUser || !(adminUser.role === 'admin')) {
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401 }
            );
        }

        // Get request body
        const { email, amount } = await request.json();

        // Validate input
        if (!email || !amount) {
            return new NextResponse(
                JSON.stringify({ error: "Email and amount are required" }),
                { status: 400 }
            );
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return new NextResponse(
                JSON.stringify({ error: "Amount must be a positive number" }),
                { status: 400 }
            );
        }

        // Find user and update points
        const user = await User.findOneAndUpdate<IUser>(
            { email: email.toLowerCase() },
            { $inc: { points: amount } },
            { new: true }
        ).select('email username points').lean();

        if (!user) {
            return new NextResponse(
                JSON.stringify({ error: "User not found" }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: "Points credited successfully",
                user: {
                    email: user.email,
                    username: user.username,
                    points: user.points
                }
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Credit user error:', error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}
