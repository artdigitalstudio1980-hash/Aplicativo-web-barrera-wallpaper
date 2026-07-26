import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactNotificationEmail, sendContactConfirmationEmail } from '@/lib/mailer';
import { contactFormSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid fields',
        details: parsed.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, email, phone, subject, message, newsletter } = parsed.data;

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message,
        language: 'en',
        status: 'NEW',
      },
    });

    if (newsletter) {
      try {
        await prisma.newsletter.upsert({
          where: { email },
          update: { isActive: true },
          create: {
            email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            isActive: true,
            language: 'en',
          },
        });
      } catch (newsletterError) {
        console.error('Error adding to newsletter:', newsletterError);
      }
    }

    try {
      await sendContactNotificationEmail({ name, email, phone: phone || undefined, subject, message });
      await sendContactConfirmationEmail(email, name);
    } catch (mailError) {
      console.error('Error sending contact emails:', mailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      submissionId: submission.id,
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
