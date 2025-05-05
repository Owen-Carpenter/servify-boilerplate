"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { Footer } from "@/components/ui/footer";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  phone?: string;
  address?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const user = session?.user as ExtendedUser;
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [bio, setBio] = useState(user?.bio || "");

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
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, address, bio }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your address"
                    />
                  ) : (
                    <p className="text-sm">{address || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a little about yourself"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm">{bio || "Not set"}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
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
                  <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => window.location.href = '/auth/forgot-password'}
                  >
                    Change Password
                  </Button>
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