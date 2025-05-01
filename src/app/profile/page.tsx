"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/ui/footer";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState(""); // Add phone number fetching if available
  const router = useRouter();

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleSave = async () => {
    // Here you'd make an API call to update the user's profile
    console.log("Saving profile changes:", { name, phone });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content with Gradient Background */}
      <main className="flex-grow pt-24 pb-20 gradient-bg relative">
        {/* Background elements similar to hero section */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-white rounded-full animate-pulse delay-200"></div>
          <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-white rounded-full animate-pulse delay-400"></div>
        </div>
        
        <div className="content-container relative z-10">
          <h1 className="text-3xl font-bold mb-8 text-white">Profile Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Profile Information */}
            <Card className="col-span-2 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{session?.user?.name || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm">{session?.user?.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  ) : (
                    <p className="text-sm">{phone || "Not set"}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => router.push("/profile/edit")}>Edit Profile</Button>
                )}
              </CardFooter>
            </Card>

            {/* Account Information */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm capitalize">{session?.user?.role || "Customer"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm">April 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Straight border with footer */}
        <div className="border-t border-white/10 mt-auto"></div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 