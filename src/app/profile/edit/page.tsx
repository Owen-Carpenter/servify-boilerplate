"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, User, Camera, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Footer } from "@/components/ui/footer";

// Extended User interface to include additional profile fields
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      // Cast to extended user type
      const user = session.user as ExtendedUser;
      
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });
      
      setAvatarSrc(user.image || null);
    }
  }, [session, form]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    
    try {
      // Here you would normally make an API call to update the user's profile
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...data,
        },
      });
      
      toast.success("Profile updated successfully");
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload this file to your server/cloud storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
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
        
        <div className="content-container relative z-10">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          </div>
          
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg mb-10">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarSrc || ""} alt={form.watch("name")} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {form.watch("name")?.charAt(0) || <User className="h-12 w-12" />}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute -right-2 bottom-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click the camera icon to change your profile picture
                  </p>
                </div>
                
                <div className="flex-1">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" type="email" {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Your email address cannot be changed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Your address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us a little about yourself"
                                className="resize-none"
                                {...field}
                                rows={4}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile. Max 160 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/profile")}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Straight border with footer */}
        <div className="border-t border-white/10 mt-auto"></div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 