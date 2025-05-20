"use client";

import React, { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

// Dynamically import the AdminDashboard component
const AdminDashboard = dynamic(() => import('@/components/dashboard/AdminDashboard'), {
  loading: () => (
    <div className="flex-grow gradient-bg pt-24 pb-12 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto text-white text-center py-20">
        <h1 className="text-3xl font-bold">Loading Admin Dashboard</h1>
        <Loader2 className="h-10 w-10 animate-spin text-white mx-auto mt-6" />
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in but not admin, redirect to the customer dashboard page
    if (status === "authenticated" && session?.user && session.user.role !== "admin") {
      router.replace('/dashboard/customer');
    }
  }, [session, status, router]);
  
  if (status === "loading") {
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
            <Button onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is admin, show admin dashboard
  if (session.user.role === 'admin') {
    return <AdminDashboard />;
  }
  
  // For regular users, we'll show a redirecting message
  // The useEffect above will handle the actual redirect
  return (
    <div className="flex-grow gradient-bg pt-24 pb-12 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto text-white text-center py-20">
        <h1 className="text-3xl font-bold">Redirecting to Customer Dashboard</h1>
        <Loader2 className="h-10 w-10 animate-spin text-white mx-auto mt-6" />
      </div>
    </div>
  );
} 