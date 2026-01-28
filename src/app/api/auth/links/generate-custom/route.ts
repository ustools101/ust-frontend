import calculateExpiresAt from "@/lib/calculateExpiresAt";
import connectDB from "@/lib/db";
import Link from "@/models/Link";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import shortid from 'shortid';

interface PageInput {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

interface CustomPage {
  id: string;
  title: string;
  subtitle: string;
  logoUrl: string;
  backgroundUrl: string;
  backgroundColor: string;
  buttonText: string;
  buttonColor: string;
  inputs: PageInput[];
}

interface CustomLinkData {
  linkName: string;
  pages: CustomPage[];
  successTitle: string;
  successMessage: string;
  successButtonText: string;
  successButtonUrl: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: CustomLinkData = await request.json();
    const { linkName, pages, successTitle, successMessage, successButtonText, successButtonUrl, duration } = data;

    // Verify session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!linkName?.trim()) {
      return NextResponse.json({ error: 'Link name is required' }, { status: 400 });
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'At least one page is required' }, { status: 400 });
    }

    const MAX_PAGES = 3;
    if (pages.length > MAX_PAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_PAGES} pages allowed` }, { status: 400 });
    }

    // Validate each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page.title?.trim()) {
        return NextResponse.json({ error: `Page ${i + 1}: Title is required` }, { status: 400 });
      }
      if (!page.buttonText?.trim()) {
        return NextResponse.json({ error: `Page ${i + 1}: Button text is required` }, { status: 400 });
      }
      if (!page.inputs || page.inputs.length === 0) {
        return NextResponse.json({ error: `Page ${i + 1}: At least one input is required` }, { status: 400 });
      }
      for (let j = 0; j < page.inputs.length; j++) {
        if (!page.inputs[j].label?.trim()) {
          return NextResponse.json({ error: `Page ${i + 1}, Input ${j + 1}: Label is required` }, { status: 400 });
        }
      }
    }

    // Calculate price
    const basePrice = 4000;
    const pagePrice = 1500;
    const effectiveBasePrice = duration === 0.5 ? basePrice / 2 : basePrice;
    const totalPagePrice = (pages.length - 1) * pagePrice;
    
    const durationMultipliers: Record<number, number> = {
      0.5: 1,
      1: 1,
      2: 2,
      4: 4,
      8: 7,
      12: 10,
    };
    
    const multiplier = durationMultipliers[duration] || 1;
    const price = (effectiveBasePrice + totalPagePrice) * multiplier;

    const expiresAt = calculateExpiresAt(duration);

    // Connect to DB and check user
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    if (!user.telegramId) {
      return NextResponse.json({ error: 'Please connect your Telegram account' }, { status: 400 });
    }

    if (user.points < price) {
      return NextResponse.json({ error: 'Not enough credits' }, { status: 400 });
    }

    // Generate link ID
    const linkId = shortid.generate();

    // Create custom link with all page configurations stored in customPages field
    const newLink = new Link({
      userId: user._id,
      linkId,
      linkName: linkName.trim(),
      linkType: 'scratch', // New type for custom-built links
      title: pages[0]?.title || 'Custom Page',
      writeup: '',
      socialMedia: [],
      otpEnabled: false,
      retry: 1,
      expiresAt,
      // Store custom configuration
      customPages: pages.map((page, index) => ({
        pageNumber: index + 1,
        title: page.title,
        subtitle: page.subtitle || '',
        writeup: page.writeup || '',
        logoUrl: page.logoUrl || '',
        backgroundUrl: page.backgroundUrl || '',
        backgroundColor: page.backgroundColor || '#ffffff',
        buttonText: page.buttonText,
        buttonColor: page.buttonColor || '#3b82f6',
        inputs: page.inputs.map(input => ({
          label: input.label,
          placeholder: input.placeholder || '',
          type: input.type,
          required: input.required,
        })),
      })),
      successPage: {
        title: successTitle || 'Success!',
        message: successMessage || 'Your submission has been received.',
        buttonText: successButtonText || 'Done',
        buttonUrl: successButtonUrl || '',
      },
    });

    await newLink.save();

    // Deduct credits
    user.points -= price;
    await user.save();

    return NextResponse.json({ 
      success: 'Custom link created successfully', 
      link: newLink,
      linkId: linkId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating custom link:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
