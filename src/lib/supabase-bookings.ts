import { supabase } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils/url";

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
  // Customer information
  customer_name?: string;
  customer_email?: string;
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
        await fetch(`${getBaseUrl()}/api/bookings/updatePendingStatus`, {
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
 * Get a single booking by ID with customer information
 * @param id The booking ID
 * @returns The booking with customer details or null if not found
 */
export async function getBookingById(id: string): Promise<SupabaseBooking | null> {
  try {
    // Use a joined query to get booking with customer information
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error("Error fetching booking by ID:", error);
      return null;
    }
    
    // Transform the data to include customer info in the main booking object
    const customerData = data.users || {};
    const bookingWithCustomerInfo = {
      ...data,
      customer_name: customerData.name || null,
      customer_email: customerData.email || null,
      users: undefined // Remove the nested users object
    };
    
    return bookingWithCustomerInfo as SupabaseBooking;
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

/**
 * Get all bookings for admin view with customer information
 * @returns An array of bookings with customer details
 */
export async function getAllBookings(): Promise<SupabaseBooking[]> {
  try {
    // For admin operations, we need to use the service role key to bypass RLS
    // Check if we're in a server environment where we can use service role
    let adminSupabase = supabase;
    
    if (typeof window === 'undefined') {
      // Server-side: Use service role key if available
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (serviceKey && serviceKey !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        adminSupabase = createClient(supabaseUrl, serviceKey);
      }
    }
    
    // Use a joined query to get bookings with customer information
    const { data, error } = await adminSupabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching all bookings:", error);
      return [];
    }
    
    // Transform the data to include customer info in the main booking object
    const bookingsWithCustomerInfo = data.map(booking => {
      const customerData = booking.users || {};
      return {
        ...booking,
        customer_name: customerData.name || null,
        customer_email: customerData.email || null,
        users: undefined // Remove the nested users object
      };
    });
    
    return bookingsWithCustomerInfo as SupabaseBooking[];
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    return [];
  }
} 