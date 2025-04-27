"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingDetails {
  id: string;
  service: string;
  date: string;
  time: string;
  amount: string;
  status?: string;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch booking details from the API
    const fetchBookingDetails = async () => {
      try {
        if (!sessionId) {
          setError("No session ID provided");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/bookings/details?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (data.success && data.booking) {
          setBookingDetails(data.booking);
        } else {
          setError(data.message || "Failed to retrieve booking details");
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError("An error occurred while retrieving your booking details");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center pt-8 pb-10 rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Booking Status</CardTitle>
            <CardDescription className="text-white/80 mt-1">
              There was an issue retrieving your booking details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6">
            <p className="text-gray-600 text-center">{error}</p>
            <p className="text-gray-600 text-center mt-2">
              If you have completed a payment, your booking is still valid. Please check your email for confirmation details or contact customer support.
            </p>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-2 flex flex-col space-y-3">
            <Link href="/dashboard" className="w-full">
              <Button variant="default" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-primary to-emerald-600 text-white text-center pt-8 pb-10 rounded-t-lg">
          <div className="mx-auto bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center mb-3">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Booking Confirmed!</CardTitle>
          <CardDescription className="text-white/80 mt-1">
            Thank you for your booking
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Booking Details</h3>
            <p className="text-sm text-gray-600">
              Confirmation #{bookingDetails?.id}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{bookingDetails?.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{bookingDetails?.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{bookingDetails?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1 text-emerald-500" />
                {bookingDetails?.status === "confirmed" ? "Confirmed" : "Processing"}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t mt-3">
              <span className="text-gray-800 font-medium">Amount Paid:</span>
              <span className="font-bold text-primary">{bookingDetails?.amount}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-2 flex flex-col space-y-3">
          <Link href="/dashboard" className="w-full">
            <Button variant="default" className="w-full">
              View My Appointments
            </Button>
          </Link>
          <Link href="/services" className="w-full">
            <Button variant="outline" className="w-full">
              Book Another Service
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 