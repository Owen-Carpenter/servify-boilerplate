import { toast } from "@/components/ui/use-toast";
import { getUserBookings, SupabaseBooking } from "./supabase-bookings";

// Appointment statuses
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Appointment interface
export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  price: number;
  status: AppointmentStatus;
  providerName: string;
  location: string;
  duration: string;
  bookingDate: Date;
  category: string;
}

// Convert Supabase booking to our Appointment interface
function mapSupabaseBookingToAppointment(booking: SupabaseBooking): Appointment {
  // Try to parse the appointment date, fallback to current date if it fails
  let appointmentDate: Date;
  try {
    appointmentDate = new Date(booking.appointment_date);
    if (isNaN(appointmentDate.getTime())) {
      appointmentDate = new Date();
    }
  } catch {
    appointmentDate = new Date();
  }
  
  // Try to parse the booking date, fallback to current date if it fails
  let bookingDate: Date;
  try {
    bookingDate = new Date(booking.created_at);
    if (isNaN(bookingDate.getTime())) {
      bookingDate = new Date();
    }
  } catch {
    bookingDate = new Date();
  }

  return {
    id: booking.id,
    serviceId: booking.service_id,
    serviceName: booking.service_name,
    date: appointmentDate,
    time: booking.appointment_time,
    price: booking.amount_paid,
    status: booking.status as AppointmentStatus,
    providerName: "Service Provider", // This information would be joined from a providers table in a real app
    location: "Service Location", // This information would be joined from a locations table in a real app
    duration: "60 min", // This information would be joined from a services table in a real app
    bookingDate: bookingDate,
    category: "service" // This information would be joined from a services table in a real app
  };
}

/**
 * Get appointments for the current user from Supabase
 * @param userId Optional user ID to pass to Supabase
 */
export async function getAppointments(userId?: string): Promise<Appointment[]> {
  try {
    console.log("getAppointments: Fetching with userId:", userId);
    
    // Fetch bookings from Supabase
    const supabaseBookings = await getUserBookings(userId);
    console.log("getAppointments: Raw Supabase bookings:", supabaseBookings);
    
    if (!supabaseBookings || supabaseBookings.length === 0) {
      console.log("getAppointments: No bookings found");
      return [];
    }
    
    // Convert to our Appointment interface
    const appointments = supabaseBookings.map(booking => {
      const appointment = mapSupabaseBookingToAppointment(booking);
      console.log("getAppointments: Mapped appointment:", appointment);
      return appointment;
    });
    
    console.log("getAppointments: Final appointments list:", appointments);
    return appointments;
  } catch (error) {
    console.error("Error in getAppointments:", error);
    return [];
  }
}

/**
 * Cancel an appointment by ID
 * @param appointmentId The ID of the appointment to cancel
 * @param userId Optional user ID to pass to Supabase
 * @returns The updated appointment or null if not found
 */
export async function cancelAppointment(appointmentId: string, userId?: string): Promise<Appointment | null> {
  try {
    // Use the server API to cancel the appointment
    const response = await fetch('/api/appointments/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        userId
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: data.message || "There was a problem cancelling your appointment.",
      });
      return null;
    }
    
    // Refresh the appointments list to get the updated data
    const appointments = await getAppointments(userId);
    const updatedAppointment = appointments.find(a => a.id === appointmentId);
    
    toast({
      variant: "success",
      title: "Appointment Cancelled",
      description: "Your appointment has been successfully cancelled",
    });
    
    return updatedAppointment || null;
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to cancel appointment. Please try again.",
    });
    
    return null;
  }
} 