import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

export async function GET(req: Request) {
  try {
    // Get the session ID from the URL params
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        message: "Session ID is required" 
      }, { status: 400 });
    }

    // Get current user session
    const session = await getServerSession();
    
    // First, try to retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!stripeSession) {
      return NextResponse.json({ 
        success: false, 
        message: "Stripe session not found" 
      }, { status: 404 });
    }

    // Get the booking ID from session metadata
    const bookingId = stripeSession.metadata?.bookingId;
    
    if (!bookingId) {
      return NextResponse.json({ 
        success: false, 
        message: "Booking ID not found in session metadata" 
      }, { status: 404 });
    }

    // Retrieve booking from Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        appointment_date,
        appointment_time,
        amount_paid,
        status,
        payment_status,
        user_id,
        service_id
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error("Error fetching booking:", error);
      
      // If booking is not in the database yet (webhook hasn't processed),
      // return some basic info from the Stripe session
      return NextResponse.json({
        success: true,
        booking: {
          id: bookingId,
          service: stripeSession.metadata?.serviceName || "Service Booking",
          date: stripeSession.metadata?.date ? new Date(stripeSession.metadata.date).toLocaleDateString() : "N/A",
          time: stripeSession.metadata?.time || "N/A",
          amount: `$${(stripeSession.amount_total ? stripeSession.amount_total / 100 : 0).toFixed(2)}`,
          status: "processing",
        }
      });
    }

    // Check if the user is allowed to access this booking
    // (either it's their booking or they're an admin)
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    if (userId !== booking.user_id && userRole !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized access to booking" 
      }, { status: 403 });
    }

    // Return the booking details
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        service: booking.service_name,
        date: new Date(booking.appointment_date).toLocaleDateString(),
        time: booking.appointment_time,
        amount: `$${booking.amount_paid.toFixed(2)}`,
        status: booking.status,
      }
    });

  } catch (error) {
    console.error("Error retrieving booking details:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to retrieve booking details" 
    }, { status: 500 });
  }
} 