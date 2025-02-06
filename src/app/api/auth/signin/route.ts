import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { compare } from "bcryptjs";
import connectDB from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const {email, password} = await request.json();
        // validate fields
        if(!email || !password) {
            return NextResponse.json({
                error: "All fields are required"
            }, { status: 400 });
        }

        await connectDB();
        
        // Find user but include password for comparison
        const user = await User.findOne({ email });
        
        if(!user) {
            return NextResponse.json({
                error: "Invalid credentials"
            }, { status: 401 });
        }

        // Compare password
        const isValid = await compare(password, user.password);
        
        if(!isValid) {
            return NextResponse.json({
                error: "Invalid credentials"
            }, { status: 401 });
        }

        // Return user without password
        return NextResponse.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            points: user.points,
            role: user.role
        }, { status: 200 });
        
    } catch(error: any) {
        console.error('Signin error:', error);
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 });
    }
}