import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactNotificationEmail, sendContactConfirmationEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, newsletter } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: 'Name, email, and message are required' 
      }, { status: 400 });
    }

    // 1. Save to database (ContactSubmission)
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message,
        language: 'en', // Default to English as per project mandate
        status: 'NEW'
      }
    });

    // 2. Add to newsletter if requested
    if (newsletter) {
      try {
        await prisma.newsletter.upsert({
          where: { email: email.toLowerCase() },
          update: { isActive: true },
          create: {
            email: email.toLowerCase(),
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            isActive: true,
            language: 'en'
          }
        });
      } catch (newsletterError) {
        console.error('Error adding to newsletter:', newsletterError);
        // Don't fail the whole request if newsletter subscription fails
      }
    }

    // 3. Send email notifications asynchronously
    // We attempt to send but don't strictly require success for the user response
    try {
      // Notify Admin
      await sendContactNotificationEmail({ name, email, phone, subject, message });
      
      // Confirm to Customer
      await sendContactConfirmationEmail(email, name);
    } catch (mailError) {
      console.error('Error sending contact emails:', mailError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully',
      submissionId: submission.id
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ 
      error: 'Failed to send message' 
    }, { status: 500 });
  }
}
