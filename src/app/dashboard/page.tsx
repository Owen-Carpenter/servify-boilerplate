"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getAppointments, cancelAppointment, type Appointment } from "@/lib/appointments";
import { Loader2, Calendar, Clock, Home, BadgeCheck, AlertTriangle, X, User as UserIcon, Pencil } from "lucide-react";
import { getUnreadUpdates, markUpdateAsRead, type Update } from "@/lib/updates";
import { format } from "date-fns";
import { type User, type UserRole } from "@/lib/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { getBookingCountsByStatus, getUserBookings, type SupabaseBooking } from "@/lib/supabase-bookings";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const router = useRouter();
  const [bookingCounts, setBookingCounts] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  // Keeping this state for future extensions where we might need to directly 
  // access the raw Supabase booking data (e.g., for detailed booking information)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [supabaseBookings, setSupabaseBookings] = useState<SupabaseBooking[]>([]);

  // Group appointments by status
  const upcomingAppointments = appointments.filter(app => app.status === 'confirmed' || app.status === 'pending');
  const pastAppointments = appointments.filter(app => app.status === 'completed' || app.status === 'cancelled');

  useEffect(() => {
    async function loadData() {
      try {
        // Use NextAuth session for user info
        if (status === "loading") return;
        if (!session || !session.user) {
          setProfile(null);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in to view your dashboard.",
          });
          return;
        }

        // Ensure we have a user ID
        const userId = session.user.id;
        if (!userId) {
          console.error("No user ID found in session");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to load user data. Please try logging in again.",
          });
          return;
        }
        
        // Build a profile object from session.user
        let phone: string = "";
        if (typeof session.user === "object" && session.user !== null && "phone" in session.user) {
          phone = (session.user as { phone?: string }).phone || "";
        }
        setProfile({
          id: userId,
          name: session.user.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          role: (session.user.role as UserRole) || "user",
          avatar: session.user.image || undefined,
          phone,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            notifications: true,
            emailUpdates: true,
            darkMode: false
          },
          address: undefined,
          paymentMethods: []
        });
        
        // Get appointments - explicitly pass the user ID from NextAuth session
        console.log("Fetching appointments for user:", userId);
        const appData = await getAppointments(userId);
        if (appData && Array.isArray(appData)) {
          console.log("Fetched appointments:", appData);
          setAppointments(appData);
        } else {
          console.error("Invalid appointment data received:", appData);
        }
        
        // Get Supabase bookings using the user ID from session
        console.log("Fetching Supabase bookings for user:", userId);
        const bookingsData = await getUserBookings(userId);
        if (bookingsData && Array.isArray(bookingsData)) {
          console.log("Fetched Supabase bookings:", bookingsData);
          setSupabaseBookings(bookingsData);
          
          // Note: we're not merging with appointments separately here
          // because getAppointments() already does the conversion
          // from SupabaseBooking to Appointment - see appointments.ts
        }
        
        // Get booking counts directly from Supabase - explicitly pass the user ID
        console.log("Fetching booking counts for user:", userId);
        const counts = await getBookingCountsByStatus(userId);
        console.log("Fetched booking counts:", counts);
        setBookingCounts(counts);
        
        // Get updates/notifications
        const updateData = await getUnreadUpdates();
        if (updateData && Array.isArray(updateData)) {
          setUpdates(updateData);
        }
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
    // Only rerun when session or status changes
  }, [session, status]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId, session?.user?.id);
      setAppointments(appointments.filter(app => app.id !== appointmentId));
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "There was an error cancelling your appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReadUpdate = async (updateId: string) => {
    try {
      await markUpdateAsRead(updateId);
      setUpdates(updates.filter(update => update.id !== updateId));
    } catch (error) {
      console.error("Error marking update as read:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Loading your dashboard...</h2>
            <p className="text-muted-foreground mt-2">Please wait while we fetch your data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">You are not logged in</h2>
            <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
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
            <h1 className="text-3xl font-bold text-white">Welcome back, {profile?.name || 'User'}</h1>
            <p className="text-white/80 mt-1">
              You have {upcomingAppointments.length} upcoming {upcomingAppointments.length === 1 ? 'appointment' : 'appointments'}
            </p>
          </div>
          <Button 
            onClick={() => router.push('/services')}
            className="bg-white text-primary hover:bg-white/90 shadow-sm"
          >
            Browse Services
          </Button>
        </div>

        {/* Updates/Notifications */}
        {updates.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-xl flex items-center">
                <BadgeCheck className="mr-2 h-5 w-5 text-primary" />
                Updates & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {updates.map((update) => (
                  <div key={update.id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{update.title}</div>
                      <div className="text-sm text-muted-foreground">{update.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(update.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReadUpdate(update.id)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full z-10 relative">
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

          {/* Overview Tab - New tab with summary */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Profile Summary Card */}
              <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardHeader className="bg-primary/5 border-b flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar || ""} />
                    <AvatarFallback className="text-xl bg-primary text-white">
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profile?.name || "User"}</CardTitle>
                    <CardDescription>{profile?.email || ""}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Member since {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center p-4 bg-secondary/10">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white"
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </CardFooter>
              </Card>

              {/* Next Appointment Card */}
              <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{upcomingAppointments[0].serviceName}</h3>
                        <Badge className={
                          upcomingAppointments[0].status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }>
                          {upcomingAppointments[0].status.charAt(0).toUpperCase() + upcomingAppointments[0].status.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(new Date(upcomingAppointments[0].date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{upcomingAppointments[0].time} ({upcomingAppointments[0].duration})</span>
                        </div>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{upcomingAppointments[0].location}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No upcoming appointments</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between gap-2 p-4 bg-secondary/10">
                  {upcomingAppointments.length > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white"
                        onClick={() => router.push(`/appointments/${upcomingAppointments[0].id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white"
                        onClick={() => router.push('/services')}
                      >
                        View All
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/services')}
                    >
                      Book a Service
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Stats Card */}
              <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle>Your Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-muted-foreground text-sm">Upcoming</p>
                        <p className="text-2xl font-bold">{bookingCounts.pending + bookingCounts.confirmed}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-muted-foreground text-sm">Completed</p>
                        <p className="text-2xl font-bold">{bookingCounts.completed}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <BadgeCheck className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-muted-foreground text-sm">Cancelled</p>
                        <p className="text-2xl font-bold">{bookingCounts.cancelled}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-6 w-6 text-red-600" />
                      </div>
                    </div>

                    {(bookingCounts.pending + bookingCounts.confirmed + bookingCounts.completed + bookingCounts.cancelled) === 0 && (
                      <div className="text-center mt-4 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
                        No booking activity yet. Browse services to make your first booking!
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center p-4 bg-secondary/10">
                  <Button
                    variant="outline"
                    className="w-full bg-white"
                    onClick={() => router.push('/services')}
                  >
                    {(bookingCounts.pending + bookingCounts.confirmed + bookingCounts.completed + bookingCounts.cancelled) > 0 
                      ? "View History" 
                      : "Browse Services"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <div className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled services</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {upcomingAppointments.length > 0 ? (
                    <div className="divide-y">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="sm:mr-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-lg">{appointment.serviceName || 'Service'}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')} • {appointment.time}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.providerName} • {appointment.location}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                            <Badge className={
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white"
                                onClick={() => router.push(`/appointments/${appointment.id}`)}
                              >
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                      <p className="text-muted-foreground mb-4">You don&apos;t have any scheduled appointments at the moment.</p>
                      <Button onClick={() => router.push('/services')}>Book a Service</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardHeader className="text-center bg-primary/5 border-b">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar || ""} />
                      <AvatarFallback className="text-2xl bg-primary text-white">
                        {profile?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="mt-2">{profile?.name || "User"}</CardTitle>
                  <CardDescription>{profile?.email || ""}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Member Since</h3>
                    <p>{profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                    <p>{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                    <p>{profile?.address?.street ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state}` : 'Not provided'}</p>
                  </div>
                  {/* Payment Methods */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Methods</h3>
                    {profile?.paymentMethods && profile.paymentMethods.length > 0 ? (
                      <div className="space-y-2">
                        {profile.paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-2 bg-secondary/10 rounded-md">
                            <div className="flex items-center">
                              <div className="mr-2 capitalize">{method.type}</div>
                              <div className="text-sm text-muted-foreground">**** {method.lastFour}</div>
                            </div>
                            {method.isDefault && (
                              <Badge variant="outline" className="text-xs">Default</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No payment methods saved</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center p-4 bg-secondary/10">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white"
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2 backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle>Account Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Notification Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive email notifications about your appointments</p>
                        </div>
                        <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive text message reminders about your appointments</p>
                        </div>
                        <div className="h-6 w-11 bg-muted rounded-full relative cursor-pointer">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Emails</p>
                          <p className="text-sm text-muted-foreground">Receive emails about new services and promotions</p>
                        </div>
                        <div className="h-6 w-11 bg-muted rounded-full relative cursor-pointer">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium mb-1">Security</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                      </div>
                      <Button variant="outline" className="bg-white">Change Password</Button>
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <UserIcon className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Complete your profile</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      Add your address and phone number to make booking services easier.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            {pastAppointments.length > 0 ? (
              <div className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>Your past appointments and services</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 flex items-center">
                          <div className="mr-4">
                            {appointment.status === 'completed' ? (
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
                            <div className="font-medium">{appointment.serviceName || 'Service'}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(appointment.date), 'MMM d, yyyy')} • {appointment.time}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.providerName} • {appointment.location}
                            </div>
                          </div>
                          <Badge className={
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                <CardContent className="flex flex-col items-center text-center p-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No service history</h3>
                  <p className="text-muted-foreground mb-4">You don&apos;t have any completed or cancelled services.</p>
                  <Button onClick={() => router.push('/services')}>Browse Services</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 