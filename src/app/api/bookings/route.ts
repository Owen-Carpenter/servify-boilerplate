import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // Get the current session to check if the user is authenticated
    const session = await getServerSession();
    
    // Parse booking data from request
    const bookingData = await req.json();
    
    // For demo purposes: Log the booking data
    console.log("Booking Request:", bookingData);
    
    // Use session data if available (authentication check)
    const userId = session?.user?.id || 'guest-user';
    
    // Create a unique booking ID
    const bookingId = `booking-${Date.now()}`;
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-03-31.basil",
    });
    
    // In a real application, we would:
    // 1. Validate the booking data
    // 2. Check if the time slot is available
    // 3. Store the booking in a database (Supabase)
    
    // Get the host from the request
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    
    // Create a Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: bookingData.serviceName || "Service Booking",
              description: `${bookingData.date ? new Date(bookingData.date).toLocaleDateString() : ""} at ${bookingData.time || ""}`,
            },
            unit_amount: Math.round((bookingData.price || 99) * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        userId,
        serviceId: bookingData.serviceId,
        date: bookingData.date ? new Date(bookingData.date).toISOString() : "",
        time: bookingData.time || "",
      },
      mode: "payment",
      success_url: `${baseUrl}/booking/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking/cancel?sessionId={CHECKOUT_SESSION_ID}`,
    });
    
    // Return the Stripe session URL for redirection
    return NextResponse.json({ 
      success: true, 
      bookingId,
      userId,
      message: "Booking created successfully",
      redirectUrl: stripeSession.url
    });
    
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating booking:", error);
    
    // Return an error response
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create booking. Please try again." 
      }, 
      { status: 500 }
    );
  }
} 