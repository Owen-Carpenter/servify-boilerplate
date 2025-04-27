import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || '');

// Webhook secret for verifying the event
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ success: false, message: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Get metadata from the session
    const { bookingId, userId, serviceId, date, time } = session.metadata || {};
    
    if (!bookingId || !userId || !serviceId) {
      console.error('Missing required metadata in session:', session.metadata);
      return NextResponse.json({ success: false, message: 'Missing required metadata' }, { status: 400 });
    }

    try {
      // 1. Retrieve service details
      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (!serviceData) {
        throw new Error(`Service not found with ID: ${serviceId}`);
      }

      // 2. Save the completed booking in the database
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          user_id: userId,
          service_id: serviceId,
          service_name: serviceData.title,
          appointment_date: date,
          appointment_time: time,
          status: 'confirmed',
          payment_status: 'paid',
          payment_intent: session.payment_intent as string,
          amount_paid: session.amount_total ? session.amount_total / 100 : serviceData.price, // Convert cents to dollars
          created_at: new Date().toISOString(),
        });

      if (bookingError) {
        throw new Error(`Error saving booking: ${bookingError.message}`);
      }

      // 3. Get user information for the email
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      // 4. Send confirmation email
      if (userData?.email) {
        await sendBookingConfirmationEmail({
          email: userData.email,
          name: userData.name || 'Valued Customer',
          bookingId,
          serviceName: serviceData.title,
          date: new Date(date).toLocaleDateString(),
          time,
          amount: `$${(session.amount_total ? session.amount_total / 100 : serviceData.price).toFixed(2)}`,
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error processing successful payment:', error);
      return NextResponse.json({ success: false, message: 'Error processing payment' }, { status: 500 });
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ success: true });
}

// Helper function to send booking confirmation email
async function sendBookingConfirmationEmail({ 
  email, 
  name, 
  bookingId, 
  serviceName, 
  date, 
  time,
  amount 
}: { 
  email: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  amount: string;
}) {
  try {
    const { error } = await resend.emails.send({
      from: 'Servify <no-reply@yourdomain.com>',
      to: email,
      subject: 'Your booking is confirmed!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Booking Confirmation</h2>
          <p>Hello ${name},</p>
          <p>Thank you for your booking! Your appointment has been confirmed.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #111827;">Booking Details</h3>
            <p style="margin: 8px 0;"><strong>Confirmation #:</strong> ${bookingId}</p>
            <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ${amount}</p>
          </div>
          
          <p>You can view your appointment details in your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="color: #4f46e5;">dashboard</a>.</p>
          
          <p>If you need to reschedule or have any questions, please contact our customer support.</p>
          
          <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
            Thank you for choosing Servify!<br />
            The Servify Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
    }
    
    return { success: !error };
  } catch (error) {
    console.error('Error in sendBookingConfirmationEmail:', error);
    return { success: false };
  }
} 