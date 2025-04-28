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
    
    // Get bookings for the current user
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
    
    return data as SupabaseBooking[];
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
    
    // Get all bookings for the user
    const { data, error } = await supabase
      .from('bookings')
      .select('status')
      .eq('user_id', authenticatedUserId);
    
    if (error) {
      console.error("Error fetching booking counts:", error);
      return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    }
    
    // Count occurrences of each status
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    data.forEach(booking => {
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