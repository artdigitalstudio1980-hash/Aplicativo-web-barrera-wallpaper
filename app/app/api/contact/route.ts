
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, newsletter } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ 
        error: 'Name, email, and message are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to newsletter if requested
    
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      newsletter,
      timestamp: new Date().toISOString()
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Message sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send message' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
