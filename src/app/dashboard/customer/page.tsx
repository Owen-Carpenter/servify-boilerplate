"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
            <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pass the user ID to the CustomerDashboard component
  return <CustomerDashboard userId={session.user.id} />;
} 