"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  Loader2, Calendar, Clock, BadgeCheck, 
  AlertTriangle, X, User as UserIcon 
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/ui/footer";
import { getAllBookings, SupabaseBooking } from "@/lib/supabase-bookings";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<SupabaseBooking[]>([]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingCounts, setBookingCounts] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  // Group bookings by status and date
  const today = new Date();
  
  const upcomingBookings = bookings.filter(booking => 
    (booking.status === 'confirmed' || booking.status === 'pending') && 
    new Date(booking.appointment_date) >= today
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    booking.status === 'cancelled' || 
    (booking.status === 'confirmed' && new Date(booking.appointment_date) < today)
  );

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Fetch all bookings (admin only)
        const allBookings = await getAllBookings();
        setBookings(allBookings);
        
        // Count bookings by status
        const counts = {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0
        };
        
        allBookings.forEach(booking => {
          if (counts.hasOwnProperty(booking.status)) {
            counts[booking.status as keyof typeof counts]++;
          }
        });
        
        setBookingCounts(counts);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading the dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

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
      
      // Update booking counts
      setBookingCounts({
        ...bookingCounts,
        confirmed: Math.max(0, bookingCounts.confirmed - 1),
        cancelled: bookingCounts.cancelled + 1
      });
      
      toast({
        title: "Booking cancelled",
        description: "The booking has been successfully cancelled",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Loading admin dashboard...</h2>
            <p className="text-muted-foreground mt-2">Please wait while we fetch the data</p>
          </CardContent>
        </Card>
      </div>
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
          
          {/* Welcome Section with Admin Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/80 mt-1">
                There are {upcomingBookings.length} upcoming bookings
              </p>
            </div>
            <Button 
              onClick={() => router.push('/services')}
              className="bg-white text-primary hover:bg-white/90 shadow-sm"
            >
              Manage Services
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full z-10 relative">
            <TabsList className="grid w-full max-w-md grid-cols-5 mx-auto bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="appointments" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Appts.
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                My Profile
              </TabsTrigger>
              <TabsTrigger value="customers" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Customers
              </TabsTrigger>
              <TabsTrigger value="history" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                History
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <div className="mt-8">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Admin Profile Card */}
                  <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                    <CardHeader className="bg-primary/5 border-b flex flex-row items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={session?.user.image || ""} />
                        <AvatarFallback className="text-xl bg-primary text-white">
                          {session?.user.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{session?.user.name || "Admin"}</CardTitle>
                        <CardDescription>Administrator</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Admin Account</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>{session?.user.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Booking Stats Card */}
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
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest 5 bookings across all users</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {bookings.length > 0 ? (
                      <div className="divide-y">
                        {bookings.slice(0, 5).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(booking.appointment_date), 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                User ID: {booking.user_id.substring(0, 8)}...
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
                                  onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-4">There are no bookings in the system yet.</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 bg-secondary/10">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white"
                      onClick={() => setActiveTab("appointments")}
                    >
                      View All Bookings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                {/* All Bookings Section */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Manage all customer bookings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {bookings.length > 0 ? (
                      <div className="divide-y">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(booking.appointment_date), 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                User ID: {booking.user_id.substring(0, 8)}...
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
                                  onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                                >
                                  Details
                                </Button>
                                {booking.status === 'confirmed' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-white hover:bg-blue-50 hover:text-blue-600 border-blue-200 text-blue-600"
                                      onClick={() => router.push(`/admin/bookings/${booking.id}/reschedule`)}
                                    >
                                      Reschedule
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </>
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
                        <p className="text-muted-foreground mb-4">There are no bookings in the system yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>Coming soon</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 text-center">
                    <UserIcon className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-lg font-medium mb-2">Customer Management</h3>
                    <p className="text-muted-foreground mb-4">This feature is coming soon. You&apos;ll be able to manage customer accounts.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {session?.user?.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{session?.user?.name || "Admin"}</h3>
                        <p className="text-muted-foreground">{session?.user?.email || ""}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
                        <p>Email: {session?.user?.email || "Not provided"}</p>
                        <p>Role: Administrator</p>
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
                      Edit Full Profile
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
                      <div className="divide-y max-h-[500px] overflow-y-auto">
                        {pastBookings.map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="sm:mr-4 self-start sm:self-center">
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
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(booking.appointment_date), 'MMM d, yyyy')} • {booking.appointment_time}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                User ID: {booking.user_id.substring(0, 8)}...
                              </div>
                            </div>
                            <div className="mt-2 sm:mt-0 sm:ml-2 self-start sm:self-center">
                              <Badge className={
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No booking history</h3>
                        <p className="text-muted-foreground mb-4">There are no completed or cancelled bookings yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Appointment Calendar at the bottom */}
          <div className="mt-8">
            <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Appointment Calendar</CardTitle>
                <CardDescription>All scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {/* Calendar component would go here */}
                <div className="h-96 bg-gray-50 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Calendar view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 