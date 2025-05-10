import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch all bookings from Supabase
    // Note: In a production app, you might want to add pagination or filtering
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch bookings" 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      bookings: bookings || [] 
    });
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    }, { status: 500 });
  }
} 