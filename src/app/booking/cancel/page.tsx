"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-center pt-8 pb-10 rounded-t-lg">
          <div className="mx-auto bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center mb-3">
            <XCircle className="h-10 w-10 text-rose-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Booking Cancelled</CardTitle>
          <CardDescription className="text-white/80 mt-1">
            Your booking process was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          <div className="space-y-4 text-center">
            <p className="text-gray-600">
              You&apos;ve cancelled the booking process. No charges have been made to your account.
            </p>
            <p className="text-gray-600">
              If you encountered any issues or have questions about our services, please contact our support team.
            </p>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-2 flex flex-col space-y-3">
          <Link href="/services" className="w-full">
            <Button variant="default" className="w-full">
              Browse Services
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 