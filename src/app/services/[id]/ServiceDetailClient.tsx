"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Service } from "@/lib/services";
import { Clock, ArrowLeft, MapPin, Check, DollarSign, CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      <div className="gradient-bg min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Service Not Found</CardTitle>
            <CardDescription>The service you&apos;re looking for doesn&apos;t exist or has been removed.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6">
            <Button onClick={handleBack} className="bg-[#6E3FC9] hover:bg-[#5931A9] text-white">
              <ArrowLeft className="mr-2" size={16} />
              Back to Services
            </Button>
          </CardFooter>
        </Card>
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
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === "all") return "All Services";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <main className="gradient-bg pt-24 pb-20 min-h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl animate-pulse delay-300"></div>
      </div>

      <div className="content-container relative z-10">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-8 flex items-center gap-2 text-white hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Back to Services
        </Button>

        <div className="max-w-6xl mx-auto">
          {/* Service Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text inline-block">{service.title}</h1>
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
                  <p className="text-gray-700 leading-relaxed">{service.details}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Clock size={18} />
                        <span className="font-medium">Duration</span>
                      </div>
                      <p>{service.time}</p>
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
                    <div className="border rounded-md overflow-hidden">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setSelectedDate(date);
                            setSelectedTime("");
                          }
                        }}
                        minDate={new Date()}
                        maxDate={addMonths(new Date(), 1)}
                        inline
                        calendarClassName="!border-0 !shadow-none"
                        dayClassName={(date: Date) => {
                          if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                            return "!bg-primary !text-white rounded-full";
                          }
                          if (date.toDateString() === new Date().toDateString()) {
                            return "!bg-primary/10 !text-primary rounded-full";
                          }
                          return "";
                        }}
                        renderCustomHeader={({
                          date,
                          decreaseMonth,
                          increaseMonth,
                          prevMonthButtonDisabled,
                          nextMonthButtonDisabled
                        }) => (
                          <div className="flex items-center justify-between px-2 py-2">
                            <button
                              onClick={decreaseMonth}
                              disabled={prevMonthButtonDisabled}
                              type="button"
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium">
                              {format(date, "MMMM yyyy")}
                            </span>
                            <button
                              onClick={increaseMonth}
                              disabled={nextMonthButtonDisabled}
                              type="button"
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                            >
                              <ArrowLeft className="h-4 w-4 rotate-180" />
                            </button>
                          </div>
                        )}
                      />
                    </div>
                    {selectedDate && (
                      <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
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
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time} className="cursor-pointer">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Location</label>
                    <Select 
                      value={selectedLocation} 
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="w-full border rounded-md h-10">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id} className="cursor-pointer">
                            {location.name}
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
                      disabled={!selectedDate || !selectedTime}
                      className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium text-lg"
                    >
                      Book Now
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

      {/* Add these styles at the end of the file */}
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit !important;
          border: none !important;
          width: 100% !important;
        }
        .react-datepicker__month-container {
          width: 100% !important;
        }
        .react-datepicker__day {
          margin: 0.2rem !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
          border-radius: 9999px !important;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
        }
        .react-datepicker__header {
          background: white !important;
          border: none !important;
          padding-top: 0.5rem !important;
        }
        .react-datepicker__day-names {
          margin-top: 0.5rem !important;
        }
        .react-datepicker__day-name {
          margin: 0.2rem !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
          color: #6b7280 !important;
        }
      `}</style>
    </main>
  );
} 