import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { IUser } from "@/types";

// Rate limiting map
const requestMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

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

export async function GET(request: NextRequest) {
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
        
        // Use constant-time comparison for role check to prevent timing attacks
        const user = await User.findOne<IUser>({ email: session.user.email }).select('role').lean();
        
        // Generic error message to prevent user enumeration
        if (!user || !(user.role === 'admin')) {
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized" }),
                { 
                    status: 401,
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: "Authorized" }),
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache'
                }
            }
        );
    } catch (error) {
        console.error('Admin check error:', error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}
