import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { currentPassword, newPassword, confirmPassword } = await request.json();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: "Unauthorized"
            }, { status: 401 });
        }
        // validate fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                error: "All fields are required"
            }, { status: 400 });
        }

        if(newPassword !== confirmPassword){
            return NextResponse.json({
                error: "New passwords do not match"
            }, { status: 400 });
        }

        if(newPassword.length < 8){
            return NextResponse.json({
                error: "New password must be at least 8 characters"
            }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        if(!user){
            return NextResponse.json({
                error: "User not found"
            }, { status: 404 });
        }

        const isPasswordValid = bcrypt.compare(currentPassword, user.password);
        if(!isPasswordValid){
            return NextResponse.json({
                error: "Invalid password"
            }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            message: "Password changed successfully"
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
