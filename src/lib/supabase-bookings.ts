import { supabase } from "@/lib/auth";

export interface SupabaseBooking {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_intent: string;
  amount_paid: number;
  created_at: string;
  updated_at: string;
  stripe_session?: {
    id?: string;
    status?: string;
    payment_status?: string;
  };
}

/**
 * Get all bookings for the current authenticated user
 * @param userId Optional user ID from NextAuth session
 * @returns An array of bookings
 */
export async function getUserBookings(userId?: string): Promise<SupabaseBooking[]> {
  try {
    let authenticatedUserId = userId;
    
    // If no userId provided, try to get from Supabase Auth as fallback
    if (!authenticatedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id;
    }
    
    if (!authenticatedUserId) {
      console.error("No authenticated user found");
      return [];
    }
    
    console.log("Fetching bookings for user ID:", authenticatedUserId);
    
    // Use direct SQL query to bypass RLS when userId is provided explicitly
    // This approach doesn't rely on the auth.uid() matching the user_id
    let bookings: SupabaseBooking[] = [];
    
    if (userId) {
      // When we have a userId from NextAuth, use a direct SQL query
      const { data, error } = await supabase
        .rpc('get_user_bookings', { user_id_param: authenticatedUserId });
      
      if (error) {
        console.error("Error fetching bookings with RPC:", error);
        
        // Fallback to direct query approach
        const { data: directData, error: directError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', authenticatedUserId)
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error("Error fetching bookings with direct query:", directError);
          return [];
        }
        
        bookings = directData as SupabaseBooking[];
      } else {
        bookings = data as SupabaseBooking[];
      }
    } else {
      // Use normal RLS approach when relying on Supabase auth
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching bookings:", error);
        return [];
      }
      
      bookings = data as SupabaseBooking[];
    }

    // For server-side enhancement, we'll use the API endpoint instead of direct Stripe access
    if (typeof window === 'undefined' && bookings.some(b => b.status === 'pending')) {
      try {
        // Make an API call to update any pending bookings
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/bookings/updatePendingStatus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: authenticatedUserId }),
        });
        
        // Re-fetch the bookings after the update
        return getUserBookings(userId);
      } catch (error) {
        console.error("Error updating pending bookings:", error);
        // Continue with current bookings if update fails
      }
    }
    
    return bookings;
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    return [];
  }
}

/**
 * Get a single booking by ID
 * @param id The booking ID
 * @returns The booking or null if not found
 */
export async function getBookingById(id: string): Promise<SupabaseBooking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error("Error fetching booking by ID:", error);
      return null;
    }
    
    return data as SupabaseBooking;
  } catch (error) {
    console.error("Error in getBookingById:", error);
    return null;
  }
}

/**
 * Cancel a booking
 * @param id The booking ID
 * @returns Success status
 */
export async function cancelBooking(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (error) {
      console.error("Error cancelling booking:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return false;
  }
}

/**
 * Get the count of bookings by status for the current user
 * @param userId Optional user ID from NextAuth session
 * @returns The counts object
 */
export async function getBookingCountsByStatus(userId?: string): Promise<{ pending: number; confirmed: number; completed: number; cancelled: number; }> {
  try {
    let authenticatedUserId = userId;
    
    // If no userId provided, try to get from Supabase Auth as fallback
    if (!authenticatedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id;
    }
    
    if (!authenticatedUserId) {
      console.error("No authenticated user found");
      return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    }
    
    // Use direct SQL query to bypass RLS when userId is provided explicitly
    // This matches the approach in getUserBookings
    let bookings: Array<{ status: string }> = [];
    
    if (userId) {
      // Try RPC first
      const { data, error } = await supabase
        .rpc('get_user_bookings', { user_id_param: authenticatedUserId });
      
      if (error) {
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('bookings')
          .select('status')
          .eq('user_id', authenticatedUserId);
        
        if (directError) {
          console.error("Error fetching booking counts:", directError);
          return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
        }
        
        bookings = directData;
      } else {
        bookings = data as Array<{ status: string }>;
      }
    } else {
      // Use normal RLS approach
      const { data, error } = await supabase
        .from('bookings')
        .select('status')
        .eq('user_id', authenticatedUserId);
      
      if (error) {
        console.error("Error fetching booking counts:", error);
        return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      }
      
      bookings = data;
    }
    
    // Count occurrences of each status
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    bookings.forEach(booking => {
      if (booking.status in counts) {
        counts[booking.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error("Error in getBookingCountsByStatus:", error);
    return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  }
}

/**
 * Update a booking's date and time
 * @param id The booking ID
 * @param appointmentDate The new appointment date in YYYY-MM-DD format
 * @param appointmentTime The new appointment time
 * @returns Success status
 */
export async function updateBookingDateTime(
  id: string, 
  appointmentDate: string, 
  appointmentTime: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating booking date/time:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateBookingDateTime:", error);
    return false;
  }
} 