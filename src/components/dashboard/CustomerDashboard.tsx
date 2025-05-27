"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname } from "next/navigation";
import { Calendar, Clock, BadgeCheck, AlertTriangle, X, User as UserIcon, Pencil, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { getBookingCountsByStatus, getUserBookings, type SupabaseBooking } from "@/lib/supabase-bookings";
import { useSession } from "next-auth/react";
import { AppointmentCalendar } from "@/components/appointment/AppointmentCalendar";
import { PendingAppointments } from "@/components/dashboard/PendingAppointments";
import { Footer } from "@/components/ui/footer";
import { type Appointment } from "@/lib/appointments";
import { getUserProfile, type UserProfile } from "@/lib/auth";
import { PageLoader } from "@/components/ui/page-loader";
import { parseDateFromDB, formatDateForDisplay, getTodayForDB, isSameDay } from "@/lib/date-utils";

// Helper function to parse time strings for sorting (e.g., "9:00 AM" -> 540 minutes)
const parseTimeToMinutes = (timeStr: string): number => {
  const [hourMin, period] = timeStr.split(' ');
  const [hour, minute] = hourMin.split(':').map(Number);
  let hours = hour;
  if (period === 'PM' && hour < 12) hours += 12;
  if (period === 'AM' && hour === 12) hours = 0;
  return hours * 60 + minute;
};

// Helper function to sort bookings by date and time (ascending)
const sortBookingsByDateTime = (bookings: SupabaseBooking[]): SupabaseBooking[] => {
  return [...bookings].sort((a, b) => {
    // First sort by date
    const dateA = parseDateFromDB(a.appointment_date);
    const dateB = parseDateFromDB(b.appointment_date);
    const dateDiff = dateA.getTime() - dateB.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff;
    }
    
    // If dates are the same, sort by time
    const timeA = parseTimeToMinutes(a.appointment_time);
    const timeB = parseTimeToMinutes(b.appointment_time);
    return timeA - timeB;
  });
};

interface CustomerDashboardProps {
  userId?: string;
}

export default function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<SupabaseBooking[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingCounts, setBookingCounts] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  // Group bookings by status and date
  const today = new Date();
  const todayForDB = getTodayForDB();
  
  const upcomingBookings = bookings.filter(booking => 
    (booking.status === 'confirmed' || booking.status === 'pending') && 
    (parseDateFromDB(booking.appointment_date) >= today || isSameDay(booking.appointment_date, todayForDB))
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    booking.status === 'cancelled' || 
    (booking.status === 'confirmed' && parseDateFromDB(booking.appointment_date) < today && !isSameDay(booking.appointment_date, todayForDB))
  );

  // Function to load user profile data
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Ensure we have a user ID either from props or session
        const authenticatedUserId = userId || session?.user?.id;
        
        if (!authenticatedUserId) {
          console.error("No authenticated user ID available");
          return;
        }
        
        // Fetch user profile data from Supabase
        await loadUserProfile(authenticatedUserId);
        
        // Fetch user bookings
        const userBookings = await getUserBookings(authenticatedUserId);
        setBookings(userBookings);
        
        // Get booking counts
        const counts = await getBookingCountsByStatus(authenticatedUserId);
        setBookingCounts(counts);
        
        // Convert bookings to appointments format for components that need it
        const appointmentsData: Appointment[] = userBookings.map(booking => ({
          id: booking.id,
          serviceId: booking.service_id,
          serviceName: booking.service_name,
          date: parseDateFromDB(booking.appointment_date),
          time: booking.appointment_time,
          price: booking.amount_paid,
          status: booking.status,
          userId: booking.user_id,
          providerName: "Service Provider",
          location: "Service Location",
          duration: "60 min",
          bookingDate: new Date(booking.created_at),
          category: "service"
        }));
        
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading your dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [userId, session]);

  // Add this effect to refresh user profile when component receives focus 
  // (such as when navigating back from profile edit)
  useEffect(() => {
    // Check if we have the user ID and if page is currently active
    if (pathname === '/' && session?.user?.id) {
      // Refresh user profile data
      loadUserProfile(session.user.id);
    }
  }, [pathname, session]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Call API to cancel booking
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      // Update the local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      // Update appointments state
      setAppointments(appointments.map(appointment => 
        appointment.id === bookingId
          ? { ...appointment, status: 'cancelled' } 
          : appointment
      ));
      
      // Update booking counts
      setBookingCounts({
        ...bookingCounts,
        confirmed: Math.max(0, bookingCounts.confirmed - 1),
        cancelled: bookingCounts.cancelled + 1
      });
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "There was an error cancelling this booking",
        variant: "destructive",
      });
    }
  };

  // Handler for when a pending appointment is removed
  const handleAppointmentDeleted = (appointmentId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    setBookings(prev => prev.filter(booking => booking.id !== appointmentId));
    setBookingCounts(prev => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1)
    }));
  };

  // Function to handle appointment selection from calendar
  const handleSelectAppointment = (appointment: Appointment) => {
    router.push(`/appointments/${appointment.id}`);
  };

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Your Dashboard" 
        subMessage="Fetching your appointments and profile information..." 
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow gradient-bg pt-24 pb-12 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-1/4 w-60 h-60 bg-white rounded-full"></div>
              <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Welcome Section with User Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {userProfile?.name || session?.user?.name || 'User'}</h1>
              <p className="text-white/80 mt-1">
                You have {upcomingBookings.length} upcoming {upcomingBookings.length === 1 ? 'booking' : 'bookings'}
              </p>
            </div>
            <Button 
              onClick={() => router.push('/services')}
              className="bg-white text-primary hover:bg-white/90 shadow-sm"
            >
              Browse Services
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full z-10 relative">
            <TabsList className="grid w-full max-w-md grid-cols-4 mx-auto bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="appointments" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Appointments
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                My Profile
              </TabsTrigger>
              <TabsTrigger value="history" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                History
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <div className="mt-8">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Display pending appointments that need payment at the top */}
                  <div className="md:col-span-3">
                    <PendingAppointments 
                      appointments={appointments} 
                      onAppointmentDeleted={handleAppointmentDeleted} 
                    />
                  </div>

                  {/* User Profile Summary Card */}
                  <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                    <CardHeader className="bg-primary/5 border-b flex flex-row items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-xl bg-primary text-white">
                          {(userProfile?.name || session?.user?.name || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{userProfile?.name || session?.user?.name || "User"}</CardTitle>
                        <CardDescription>{userProfile?.email || session?.user?.email || ""}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Member</span>
                      </div>
                      {userProfile?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.phone}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-center p-4 bg-secondary/10">
                      <Button 
                        variant="outline" 
                        className="w-full bg-white"
                        onClick={() => router.push('/profile')}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Appointment Stats */}
                  <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0 col-span-2">
                    <CardHeader className="bg-primary/5 border-b">
                      <CardTitle>Booking Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Pending</p>
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.pending}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Confirmed</p>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.confirmed}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Completed</p>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <BadgeCheck className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.completed}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Cancelled</p>
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                              <X className="h-4 w-4 text-red-600" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.cancelled}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Bookings */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Your Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {bookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(bookings).slice(0, 5).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(booking.appointment_date, 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                              <Badge className={
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white"
                                  onClick={() => router.push(`/appointments/${booking.id}`)}
                                >
                                  Details
                                </Button>
                                {booking.status === 'confirmed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-4">You haven&apos;t made any bookings yet.</p>
                        <Button onClick={() => router.push('/services')}>Browse Services</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                {/* All Bookings Section */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Your upcoming and past appointments</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {bookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(bookings).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(booking.appointment_date, 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                              <Badge className={
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white"
                                  onClick={() => router.push(`/appointments/${booking.id}`)}
                                >
                                  Details
                                </Button>
                                {booking.status === 'confirmed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-4">You haven&apos;t made any bookings yet.</p>
                        <Button onClick={() => router.push('/services')}>Browse Services</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {(userProfile?.name || session?.user?.name || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{userProfile?.name || session?.user?.name || "User"}</h3>
                        <p className="text-muted-foreground">{userProfile?.email || session?.user?.email || ""}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
                        <p>Email: {userProfile?.email || session?.user?.email || "Not provided"}</p>
                        {userProfile?.phone && <p>Phone: {userProfile.phone}</p>}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">Security Settings</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Password</h4>
                            <p className="text-sm text-muted-foreground">Change your account password</p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => router.push('/auth/change-password')}
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 bg-secondary/10">
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/profile')}
                    >
                      Edit Profile
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>Past and cancelled bookings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pastBookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(pastBookings).map((booking) => (
                          <div key={booking.id} className="p-4 flex items-center">
                            <div className="mr-4">
                              {booking.status === 'completed' ? (
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <BadgeCheck className="h-5 w-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                  <X className="h-5 w-5 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(booking.appointment_date, 'MMM d, yyyy')} • {booking.appointment_time}
                              </div>
                            </div>
                            <Badge className={
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No booking history</h3>
                        <p className="text-muted-foreground mb-4">You don&apos;t have any completed or cancelled bookings yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Appointment Calendar at the bottom */}
          <div className="mt-8">
            <AppointmentCalendar 
              appointments={appointments} 
              onSelectEvent={handleSelectAppointment}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 