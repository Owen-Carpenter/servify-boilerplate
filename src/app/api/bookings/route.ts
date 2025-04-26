import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Get the current session to check if the user is authenticated
    const session = await auth();
    
    // Parse booking data from request
    const bookingData = await req.json();
    
    // For demo purposes: Log the booking data
    console.log("Booking Request:", bookingData);
    
    // Use session data if available (authentication check)
    const userId = session?.user?.id || 'guest-user';
    
    // In a real application, we would:
    // 1. Validate the booking data
    // 2. Check if the time slot is available
    // 3. Store the booking in a database (Supabase)
    // 4. Return a success response with booking ID
    
    // Instead for this demo, we'll just return a mock response
    return NextResponse.json({ 
      success: true, 
      bookingId: `booking-${Date.now()}`,
      userId,
      message: "Booking created successfully",
      // This would be used for Stripe integration
      redirectUrl: `/api/checkout?bookingId=booking-${Date.now()}&amount=${bookingData.price || 99}`
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