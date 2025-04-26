"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getAppointments, cancelAppointment, type Appointment } from "@/lib/appointments";
import { Loader2, Calendar, Clock, Home, BadgeCheck, AlertTriangle, X, User as UserIcon, Trash2, Pencil } from "lucide-react";
import { getUnreadUpdates, markUpdateAsRead, type Update } from "@/lib/updates";
import { format } from "date-fns";
import { getUserProfile, type User } from "@/lib/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const router = useRouter();
  const [isCompletedShown, setIsCompletedShown] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Get user data
        const profileData = await getUserProfile();
        if (profileData) {
          setProfile(profileData);
        }
        
        // Get appointments
        const appData = await getAppointments();
        if (appData && Array.isArray(appData)) {
          setAppointments(appData);
        }
        
        // Get updates/notifications
        const updateData = await getUnreadUpdates();
        if (updateData && Array.isArray(updateData)) {
          setUpdates(updateData);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
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

  if (isLoading) {
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

  return (
    <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-1/4 w-60 h-60 bg-white rounded-full"></div>
            <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {profile?.name || 'User'}</h1>
            <p className="text-white/80 mt-1">Here&apos;s what&apos;s happening with your services today</p>
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
        <Tabs defaultValue="appointments" className="w-full z-10 relative">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto bg-white/20 backdrop-blur-sm">
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

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <Card key={appointment.id} className="backdrop-blur-sm bg-white/90 shadow-md border-0 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{appointment.serviceName || 'Service'}</CardTitle>
                        <Badge className={
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        Booked on {format(new Date(appointment.bookingDate), 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/10 flex justify-between gap-2 p-4">
                      {appointment.status !== 'cancelled' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white"
                            onClick={() => router.push(`/appointments/${appointment.id}`)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => router.push('/services')}
                        >
                          Book Again
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full backdrop-blur-sm bg-white/90 shadow-md border-0 overflow-hidden">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                    <p className="text-muted-foreground mb-4">You don&apos;t have any scheduled appointments at the moment.</p>
                    <Button onClick={() => router.push('/services')}>Book a Service</Button>
                  </CardContent>
                </Card>
              )}
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
            {appointments.filter(app => app.status === 'completed' || app.status === 'cancelled').length > 0 ? (
              <div className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>Your past appointments and services</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {appointments
                        .filter(app => app.status === 'completed' || app.status === 'cancelled')
                        .map((appointment) => (
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
                <Button
                  onClick={() => setIsCompletedShown(!isCompletedShown)}
                  size="sm"
                  className={isCompletedShown ? "servify-btn-primary" : "servify-btn-secondary"}
                >
                  {isCompletedShown ? "Hide Completed" : "Show Completed"}
                </Button>
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