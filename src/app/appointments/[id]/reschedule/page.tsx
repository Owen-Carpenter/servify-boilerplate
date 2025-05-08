'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
// import { Service } from '@/lib/services'; // Assuming Service type is available
import { Appointment } from '@/lib/appointments'; // Assuming Appointment type is available
// import { getAppointmentById, updateAppointmentDateTime } from '@/lib/appointments'; // Placeholder functions
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Available time slots - would come from real data in production, considering existing bookings
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

export default function RescheduleAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  // const [service, setService] = useState<Service | null>(null); // We might need service details too
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      const fetchAppointmentDetails = async () => {
        setIsLoading(true);
        try {
          // const apptData = await getAppointmentById(appointmentId); 
          // Simulate fetching data
          const apptData: Appointment | null = {
            id: appointmentId,
            serviceId: 'service123', // Added required field
            serviceName: 'Sample Service',
            date: new Date(), 
            time: '10:00 AM',
            status: 'confirmed',
            providerName: 'Provider X',
            location: 'Main Office',
            duration: '60 min',
            price: 50,
            bookingDate: new Date(), // Added required field
            category: 'sample-category' // Added required field
          };
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (apptData) {
            setAppointment(apptData);
            setSelectedDate(new Date(apptData.date));
            setSelectedTime(apptData.time);
          } else {
            toast.error('Appointment not found.');
            router.push('/dashboard?tab=appointments');
          }
        } catch (error) {
          console.error('Error fetching appointment details:', error);
          toast.error('Failed to load appointment details.');
          router.push('/dashboard?tab=appointments');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointmentDetails();
    }
  }, [appointmentId, router]);

  const handleBack = () => {
    router.back();
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !appointment) {
      toast.error('Please select a new date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      // const success = await updateAppointmentDateTime(appointment.id, selectedDate, selectedTime);
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      const success = true; 

      if (success) {
        toast.success('Appointment rescheduled successfully!');
        router.push(`/appointments/${appointment.id}`);
      } else {
        toast.error('Failed to reschedule appointment. The selected slot may no longer be available.');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('An error occurred while rescheduling.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
            <p className="text-lg font-medium">Loading appointment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    // This case should ideally be handled by the redirect in useEffect
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Appointment Not Found</CardTitle>
          </CardHeader>
          <CardFooter className="justify-center pb-6">
            <Button onClick={() => router.push('/dashboard?tab=appointments')} className="bg-[#6E3FC9] hover:bg-[#5931A9] text-white">
              <ArrowLeft className="mr-2" size={16} />
              Back to Appointments
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <main className="gradient-bg pt-24 pb-20 min-h-screen">
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
          Back to Appointment Details
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-indigo-600/10 border-b">
              <CardTitle className="text-2xl text-center">Reschedule Appointment</CardTitle>
              <CardDescription className="text-center">
                Current: {format(new Date(appointment.date), "EEEE, MMMM d, yyyy")} at {appointment.time}
                <br />
                Service: {appointment.serviceName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select New Date</label>
                <div className="border rounded-md overflow-hidden">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setSelectedDate(date);
                        setSelectedTime(''); // Reset time when date changes
                      }
                    }}
                    minDate={new Date()} // Prevent selecting past dates
                    // maxDate={addMonths(new Date(), 1)} // Optional: limit future booking range
                    inline
                    calendarClassName="!border-0 !shadow-none"
                    dayClassName={(date: Date) => {
                      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                        return "!bg-primary !text-white rounded-full";
                      }
                      // Highlight current appointment date if different from selected
                      if (!selectedDate && date.toDateString() === new Date(appointment.date).toDateString()){
                        return "!bg-primary/20 !text-primary rounded-full";
                      }
                      if (date.toDateString() === new Date().toDateString() && (!selectedDate || selectedDate.toDateString() !== new Date().toDateString() )) {
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
                      Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select New Time</label>
                <Select 
                  value={selectedTime}
                  onValueChange={(value) => setSelectedTime(value)}
                  disabled={!selectedDate}
                >
                  <SelectTrigger className="w-full border rounded-md h-10">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Filter time slots based on selectedDate and service duration to avoid conflicts */}
                    {timeSlots.map((time) => (
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
                    New Appointment Time
                  </h3>
                  <p className="text-gray-600">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    {' '} at {selectedTime}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 p-6">
              <div className="w-full space-y-4">
                <Button 
                  onClick={handleReschedule} 
                  disabled={!selectedDate || !selectedTime || isSubmitting || (selectedDate.toDateString() === new Date(appointment.date).toDateString() && selectedTime === appointment.time)}
                  className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium text-lg"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Rescheduling...</>
                  ) : (
                    'Confirm Reschedule'
                  )}
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleBack} 
                  className="w-full text-gray-600 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Please note that rescheduling may be subject to availability.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
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