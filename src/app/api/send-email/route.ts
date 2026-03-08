// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { subject, text, html } = await request.json();

    // IMPORTANT: You need to configure your email provider credentials in environment variables.
    // For Gmail, you may need to use an "App Password" if you have 2-Step Verification enabled.
    // See: https://support.google.com/accounts/answer/185833
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER, // Your Gmail address
        pass: process.env.EMAIL_SERVER_PASSWORD, // Your Gmail App Password
      },
    });

    const mailOptions = {
      from: `"OnyxOps IA" <${process.env.EMAIL_SERVER_USER}>`,
      to: 'rokhydly@gmail.com', // The address to send the copies to
      subject: subject,
      text: text,
      html: html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    // It's good practice to not expose detailed error messages to the client.
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
