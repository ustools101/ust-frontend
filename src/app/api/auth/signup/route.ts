import { NextRequest, NextResponse } from "next/server";
import User from '@/models/User';
import bcrypt from "bcryptjs";
import connectDB from '@/lib/db';
import { validateUsername, validateEmail, validatePassword, sanitizeUsername } from '@/lib/validation';

export async function POST(request: NextRequest) {
 try {
    const {email, username, password, confirmPassword} = await request.json();
    
    // Validate required fields
    if(!email || !username || !password || !confirmPassword) {
        return new NextResponse(JSON.stringify({error: "All fields are required"}), {status: 400});
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
        return new NextResponse(JSON.stringify({error: emailError.message}), {status: 400});
    }

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
        return new NextResponse(JSON.stringify({error: usernameError.message}), {status: 400});
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        return new NextResponse(JSON.stringify({error: passwordError.message}), {status: 400});
    }

    // Check password confirmation
    if(password !== confirmPassword) {
        return new NextResponse(JSON.stringify({error: "Passwords do not match"}), {status: 400});
    }

    await connectDB();

    // Sanitize username before checking existence
    const sanitizedUsername = sanitizeUsername(username);

    // Check if user with same email or username already exists (case insensitive)
    const existingUser = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: { $regex: new RegExp('^' + sanitizedUsername + '$', 'i') } }
        ]
    });

    if(existingUser) {
        const field = existingUser.email.toLowerCase() === email.toLowerCase() ? 'email' : 'username';
        return new NextResponse(
            JSON.stringify({error: `This ${field} is already taken`}),
            {status: 400}
        );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create new user with sanitized username
    const newUser = new User({
        email: email.toLowerCase(),
        username: sanitizedUsername.toLowerCase(),
        password: hash
    });
    await newUser.save();

    return new NextResponse(
        JSON.stringify({
            message: "User created successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username
            }
        }),
        {status: 201}
    );

 } catch(error) {
    console.error('Signup error:', error);
    return new NextResponse(
        JSON.stringify({error: "An unexpected error occurred"}),
        {status: 500}
    );
 }
}