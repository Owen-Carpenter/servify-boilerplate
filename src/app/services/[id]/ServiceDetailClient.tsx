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
import { Clock, ArrowLeft, MapPin, Check, DollarSign } from "lucide-react";

interface ServiceDetailClientProps {
  service: Service | null;
}

export default function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("main-office");
  
  // Handle back button click
  const handleBack = () => {
    router.back();
  };
  
  // If service is null, show error state
  if (!service) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
        <p className="mb-6">The service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2" size={16} />
          Back to Services
        </Button>
      </div>
    );
  }
  
  // Handle booking
  const handleBooking = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }
    
    // Format date for display
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create booking payload
    const bookingData = {
      serviceId: service.id,
      serviceName: service.title,
      date: selectedDate,
      time: selectedTime,
      price: service.price,
      location: selectedLocation,
      duration: service.time,
      userId: session?.user?.id || 'guest'
    };
    
    try {
      // Make API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Booking confirmed for ${formattedDate} at ${selectedTime}`);
        
        // Redirect to checkout or confirmation page (if needed)
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      } else {
        toast.error(result.message || "Something went wrong with your booking");
      }
      
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process your booking. Please try again.");
    }
  };
  
  // Available time slots - would come from real data in production
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  
  // Locations - would come from real data in production
  const locations = [
    { id: "main-office", name: "Main Office - Downtown" },
    { id: "north-branch", name: "North Branch" },
    { id: "south-branch", name: "South Branch" },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2" size={16} />
        Back to Services
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{service.title}</CardTitle>
              <CardDescription className="flex items-center">
                <Clock size={16} className="mr-1" />
                {service.time} duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-2">About this service</h3>
              <p className="text-sm opacity-90 whitespace-pre-line">
                {service.details}
              </p>
              
              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <h3 className="font-medium mb-2">What to expect</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span>Professional and experienced service provider</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span>Comfortable and clean environment</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span>Satisfaction guaranteed or your money back</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-2">
                  <DollarSign size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">${service.price}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-2">
                  <Clock size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{service.time}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-2">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold capitalize">{service.category}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Booking Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Book this Service</CardTitle>
              <CardDescription>Select date, time, and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose a date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md"
                  disabled={(date) => {
                    // Disable past dates and Sundays
                    return date < new Date() || date.getDay() === 0;
                  }}
                />
              </div>
              
              {selectedDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose a time</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose a location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
              >
                Book Now • ${service.price}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 