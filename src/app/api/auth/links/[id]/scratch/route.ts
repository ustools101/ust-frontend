import connectDB from "@/lib/db";
import Link from "@/models/Link";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface PageInput {
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

interface CustomPage {
  pageNumber: number;
  title: string;
  subtitle: string;
  writeup: string;
  logoUrl: string;
  backgroundUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  inputs: PageInput[];
}

interface SuccessPage {
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
}

interface UpdateData {
  linkName: string;
  customPages: CustomPage[];
  successPage: SuccessPage;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data: UpdateData = await request.json();
    const { linkName, customPages, successPage } = data;

    // Validate required fields
    if (!linkName?.trim()) {
      return NextResponse.json({ error: 'Link name is required' }, { status: 400 });
    }

    if (!customPages || customPages.length === 0) {
      return NextResponse.json({ error: 'At least one page is required' }, { status: 400 });
    }

    const MAX_PAGES = 3;
    if (customPages.length > MAX_PAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_PAGES} pages allowed` }, { status: 400 });
    }

    // Validate each page
    for (let i = 0; i < customPages.length; i++) {
      const page = customPages[i];
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

    await connectDB();

    // Find the link and verify ownership
    const link = await Link.findById(id);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (link.linkType !== 'scratch') {
      return NextResponse.json({ error: 'This is not a custom link' }, { status: 400 });
    }

    // Update the link
    link.linkName = linkName.trim();
    link.customPages = customPages.map((page, index) => ({
      pageNumber: index + 1,
      title: page.title,
      subtitle: page.subtitle || '',
      writeup: page.writeup || '',
      logoUrl: page.logoUrl || '',
      backgroundUrl: page.backgroundUrl || '',
      backgroundColor: page.backgroundColor || '#ffffff',
      textColor: page.textColor || '#111827',
      buttonText: page.buttonText,
      buttonColor: page.buttonColor || '#3b82f6',
      buttonTextColor: page.buttonTextColor || '#ffffff',
      inputs: page.inputs.map(input => ({
        label: input.label,
        placeholder: input.placeholder || '',
        type: input.type,
        required: input.required,
      })),
    }));
    link.successPage = {
      title: successPage?.title || 'Success!',
      message: successPage?.message || 'Your submission has been received.',
      buttonText: successPage?.buttonText || 'Done',
      buttonUrl: successPage?.buttonUrl || '',
    };

    await link.save();

    return NextResponse.json({ 
      success: 'Link updated successfully',
      link,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating scratch link:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
