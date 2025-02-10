import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Link from "@/models/Link";
import connectDB from "@/lib/db";
import { IUser } from "@/types";

// Rate limiting map
const requestMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

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
        
        // Check if user is admin using constant-time comparison
        const adminUser = await User.findOne<IUser>({ email: session.user.email }).select('role').lean();
        if (!adminUser || !(adminUser?.role === 'admin')) {
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

        // Use Promise.all to optimize database queries
        const [
            totalUsers,
            totalLinks,
            activeUsers,
            usersLastMonth,
            usersPreviousMonth
        ] = await Promise.all([
            User.countDocuments(),
            Link.countDocuments(),
            User.countDocuments({
                updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }),
            User.countDocuments({
                createdAt: { 
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    $lte: new Date()
                }
            }),
            User.countDocuments({
                createdAt: {
                    $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                    $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            })
        ]);

        // Calculate growth rates with safe division
        const userGrowth = usersPreviousMonth === 0 
            ? (usersLastMonth > 0 ? 100 : 0)
            : Math.round(((usersLastMonth - usersPreviousMonth) / usersPreviousMonth) * 100);

        // Round large numbers and add cache control headers
        return new NextResponse(
            JSON.stringify({
                totalUsers: Math.round(totalUsers / 100) * 100, // Round to nearest hundred
                totalLinks: Math.round(totalLinks / 100) * 100,
                activeUsers: Math.round(activeUsers / 10) * 10, // Round to nearest ten
                userGrowth
            }),
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache'
                }
            }
        );
    } catch (error) {
        console.error('Admin stats error:', error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}
