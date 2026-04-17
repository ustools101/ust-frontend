import { NextRequest, NextResponse } from "next/server";
import User from '@/models/User';
import bcrypt from "bcryptjs";
import connectDB from '@/lib/db';
import { validateEmail, validatePassword } from '@/lib/validation';

function generateUsername(email: string): string {
    const prefix = email.split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 12) || 'user';
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${prefix}_${suffix}`;
}

export async function POST(request: NextRequest) {
    try {
        const { email, password, confirmPassword } = await request.json();

        if (!email || !password || !confirmPassword) {
            return new NextResponse(JSON.stringify({ error: "All fields are required" }), { status: 400 });
        }

        const emailError = validateEmail(email);
        if (emailError) {
            return new NextResponse(JSON.stringify({ error: emailError.message }), { status: 400 });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return new NextResponse(JSON.stringify({ error: passwordError.message }), { status: 400 });
        }

        if (password !== confirmPassword) {
            return new NextResponse(JSON.stringify({ error: "Passwords do not match" }), { status: 400 });
        }

        await connectDB();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ error: "This email is already registered" }), { status: 400 });
        }

        // Generate a unique username (retry up to 5 times on collision)
        let username = '';
        for (let i = 0; i < 5; i++) {
            const candidate = generateUsername(email);
            const taken = await User.findOne({ username: candidate });
            if (!taken) { username = candidate; break; }
        }
        if (!username) username = `user_${Date.now()}`;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: email.toLowerCase(),
            username,
            password: hash,
            points: 0
        });
        await newUser.save();

        return new NextResponse(
            JSON.stringify({
                message: "User created successfully",
                user: { id: newUser._id, email: newUser.email, username: newUser.username }
            }),
            { status: 201 }
        );

    } catch (error) {
        console.error('Signup error:', error);
        return new NextResponse(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
    }
}
