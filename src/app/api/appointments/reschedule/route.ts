import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { appointmentId, appointmentDate, appointmentTime, userId } = body;
    
    // Validate required fields
    if (!appointmentId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields' 
        },
        { status: 400 }
      );
    }
    
    // Get the booking to check if the user is authorized to update it
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (fetchError || !booking) {
      console.error('Error fetching booking:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Appointment not found' 
        },
        { status: 404 }
      );
    }
    
    // Verify the user owns this appointment if userId is provided
    if (userId && booking.user_id !== userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authorized to reschedule this appointment' 
        },
        { status: 403 }
      );
    }
    
    // Check if the booking can be rescheduled (not cancelled/completed)
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot reschedule an appointment that is ${booking.status}` 
        },
        { status: 400 }
      );
    }
    
    // Update the booking in Supabase
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (updateError) {
      console.error('Error updating booking date/time:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update appointment' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: {
        id: booking.id,
        serviceId: booking.service_id,
        serviceName: booking.service_name,
        date: appointmentDate,
        time: appointmentTime,
        status: booking.status
      }
    });
  } catch (error) {
    console.error("Error in reschedule API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while rescheduling' 
      },
      { status: 500 }
    );
  }
} 