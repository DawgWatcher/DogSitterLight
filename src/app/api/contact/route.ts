import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const operatorEmail =
      process.env.OPERATOR_EMAIL || 'bookings@thepuppad.com';

    await getResendClient().emails.send({
      from: 'ThePupPad <bookings@thepuppad.com>',
      to: operatorEmail,
      replyTo: email.trim(),
      subject: `Contact Form: ${name.trim()}`,
      text: [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        '',
        message.trim(),
      ].join('\n'),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form send failed:', err);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    );
  }
}
