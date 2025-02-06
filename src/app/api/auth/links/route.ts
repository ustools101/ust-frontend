import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Link from '@/models/Link';
import User from '@/models/User';

export async function GET() {
    try {
        // verify session
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Connect to database
        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch user's links
        const links = await Link.find({ userId: user._id })
            .sort({ createdAt: -1 });

        return NextResponse.json({ links }, { status: 200 });
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        // Get linkId from URL
        const url = new URL(request.url);
        const linkId = url.pathname.split('/').pop();

        if (!linkId) {
            return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
        }

        // verify session
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Connect to database
        await connectDB();

        // Find and delete the link
        const link = await Link.findOneAndDelete({
            linkId,
            userId: session.user.id
        });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Link deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting link:', error);
        return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
    }
}
