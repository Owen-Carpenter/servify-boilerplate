import { toast } from "@/components/ui/use-toast";

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

// Helper function to create a valid date or fallback to current date
function createValidDate(dayOffset: number): Date {
  try {
    return new Date(Date.now() + 86400000 * dayOffset);
  } catch (error) {
    console.error("Error creating date with offset", dayOffset, error);
    return new Date(); // Fallback to current date
  }
}

// Sample data (in a real app, this would be fetched from an API)
const mockAppointments: Appointment[] = [
  {
    id: "appt-1",
    serviceId: "1",
    serviceName: "Business Consultation",
    date: createValidDate(3), // 3 days from now
    time: "10:00 AM",
    price: 99,
    status: "confirmed",
    providerName: "John Smith",
    location: "Online Meeting",
    duration: "60 min",
    bookingDate: createValidDate(-2), // 2 days ago
    category: "consulting"
  },
  {
    id: "appt-2",
    serviceId: "2",
    serviceName: "Haircut & Styling",
    date: createValidDate(7), // 7 days from now
    time: "2:30 PM",
    price: 49,
    status: "pending",
    providerName: "Sarah Johnson",
    location: "123 Beauty Ave, Suite 4",
    duration: "45 min",
    bookingDate: createValidDate(-1), // 1 day ago
    category: "beauty"
  },
  {
    id: "appt-3",
    serviceId: "5",
    serviceName: "Massage Therapy",
    date: createValidDate(-5), // 5 days ago
    time: "3:00 PM",
    price: 79,
    status: "completed",
    providerName: "Michael Chen",
    location: "Relaxation Spa, 456 Wellness Blvd",
    duration: "60 min",
    bookingDate: createValidDate(-15), // 15 days ago
    category: "beauty"
  },
  {
    id: "appt-4",
    serviceId: "3",
    serviceName: "Home Repair",
    date: createValidDate(14), // 14 days from now
    time: "9:00 AM",
    price: 129,
    status: "confirmed",
    providerName: "Robert Wilson",
    location: "Your Home Address",
    duration: "120 min",
    bookingDate: createValidDate(-3), // 3 days ago
    category: "maintenance"
  }
];

/**
 * Get appointments for the current user
 * In a real app, this would likely fetch from an API with authentication
 */
export async function getAppointments(): Promise<Appointment[]> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ensure all dates are valid before returning
      const validatedAppointments = mockAppointments.map(appointment => ({
        ...appointment,
        date: appointment.date instanceof Date && !isNaN(appointment.date.getTime()) 
          ? appointment.date 
          : new Date(),
        bookingDate: appointment.bookingDate instanceof Date && !isNaN(appointment.bookingDate.getTime())
          ? appointment.bookingDate
          : new Date()
      }));
      
      resolve(validatedAppointments);
    }, 800);
  });
}

/**
 * Cancel an appointment by ID
 * @param appointmentId The ID of the appointment to cancel
 * @returns The updated appointment or null if not found
 */
export async function cancelAppointment(appointmentId: string): Promise<Appointment | null> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const appointmentIndex = mockAppointments.findIndex(
        (appointment) => appointment.id === appointmentId
      );

      if (appointmentIndex === -1) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Appointment not found",
        });
        resolve(null);
        return;
      }

      // Check if appointment is already cancelled
      if (mockAppointments[appointmentIndex].status === "cancelled") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Appointment is already cancelled",
        });
        resolve(null);
        return;
      }

      // Safely check if appointment is in the past
      const appointmentDate = mockAppointments[appointmentIndex].date;
      const isValidDate = appointmentDate instanceof Date && !isNaN(appointmentDate.getTime());
      
      if (isValidDate && appointmentDate < new Date()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot cancel past appointments",
        });
        resolve(null);
        return;
      }

      // Update the appointment status to cancelled
      mockAppointments[appointmentIndex] = {
        ...mockAppointments[appointmentIndex],
        status: "cancelled",
      };

      toast({
        variant: "success",
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled",
      });

      resolve(mockAppointments[appointmentIndex]);
    }, 800);
  });
} 