"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Service } from "@/lib/services";
import { Clock, ArrowLeft, MapPin, Calendar as CalendarIcon, Check, DollarSign } from "lucide-react";

interface ServiceDetailClientProps {
  service: Service | null;
}

export default function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate available times
  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // If service not found
  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Service Not Found</CardTitle>
            <CardDescription className="text-lg mt-2">We couldn&apos;t find the service you&apos;re looking for.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-8">
            <Button 
              onClick={() => router.push("/services")} 
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-2"
            >
              <ArrowLeft size={16} />
              Back to Services
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!session) {
      toast.error("Please sign in to book a service");
      router.push("/auth/login");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and time for your appointment");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simulate booking process with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Appointment booked successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <main className="gradient-bg pt-24 pb-20 min-h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl animate-pulse delay-300"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/services")} 
          className="mb-8 flex items-center gap-2 text-white hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Back to Services
        </Button>

        <div className="max-w-6xl mx-auto">
          {/* Service Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text inline-block">{service.name}</h1>
            <div className="flex justify-center items-center">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                {formatCategoryName(service.category)}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Service Details */}
            <div className="flex flex-col gap-6">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    About This Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Clock size={18} />
                        <span className="font-medium">Duration</span>
                      </div>
                      <p>{service.duration}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <DollarSign size={18} />
                        <span className="font-medium">Price</span>
                      </div>
                      <p className="text-xl font-bold">${service.price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Professional consultation with our experts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Personalized service tailored to your needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Follow-up support after your appointment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Access to premium resources and tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Servify Headquarters</p>
                      <p className="text-gray-600">123 Service Lane, Suite 456</p>
                      <p className="text-gray-600">Business District, NY 10001</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 h-32 rounded-lg mt-4 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Interactive map</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div>
              <Card className="bg-white/95 backdrop-blur-sm sticky top-24 border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-indigo-600/10 border-b">
                  <CardTitle className="text-2xl text-center">Book Your Appointment</CardTitle>
                  <CardDescription className="text-center">Select your preferred date and time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Date</label>
                    <div className="border rounded-md overflow-hidden flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          // Disable dates in the past and more than 14 days in the future
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const twoWeeksLater = new Date(today);
                          twoWeeksLater.setDate(today.getDate() + 14);
                          
                          return date < today || date > twoWeeksLater;
                        }}
                        className="rounded-md p-0 mx-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Time</label>
                    <Select 
                      onValueChange={(value) => setSelectedTime(value)}
                      disabled={!selectedDate}
                    >
                      <SelectTrigger className="w-full border rounded-md h-10">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time} className="cursor-pointer">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDate && selectedTime && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <CalendarIcon size={16} className="text-primary" />
                        Your Selection
                      </h3>
                      <p className="text-gray-600">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {' '} at {selectedTime}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 p-6">
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">${service.price.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={handleBooking} 
                      disabled={!selectedDate || !selectedTime || isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium text-lg"
                    >
                      {isSubmitting ? "Processing..." : "Book Now"}
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      By booking, you agree to our terms and conditions.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 