import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { checkStripePaymentStatus } from "@/server/stripe";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    // Get user ID from request or session
    const { userId: requestUserId } = await req.json();
    const userId = requestUserId || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all pending bookings for this user
    const { data: pendingBookings, error } = await supabase
      .from("bookings")
      .select("id, payment_intent")
      .eq("user_id", userId)
      .eq("status", "pending");
    
    if (error) {
      console.error("Error fetching pending bookings:", error);
      return NextResponse.json(
        { success: false, message: "Error fetching pending bookings" },
        { status: 500 }
      );
    }
    
    if (!pendingBookings || pendingBookings.length === 0) {
      // No pending bookings to update
      return NextResponse.json({
        success: true,
        message: "No pending bookings found",
        updated: 0
      });
    }

    let updatedCount = 0;
    
    // Check and update each pending booking
    for (const booking of pendingBookings) {
      try {
        if (!booking.payment_intent) continue;
        
        // Check if payment is complete using our server-side function
        const { isComplete } = await checkStripePaymentStatus(booking.payment_intent);
        
        if (isComplete) {
          // Update booking to confirmed status
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.id);
          
          if (!updateError) {
            updatedCount++;
            console.log(`Successfully updated booking ${booking.id} from pending to confirmed`);
          } else {
            console.error(`Error updating booking ${booking.id}:`, updateError);
          }
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        // Continue with other bookings even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} bookings from pending to confirmed`,
      updated: updatedCount
    });
  } catch (error) {
    console.error("Error in updatePendingStatus:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 