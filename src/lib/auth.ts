import { createClient } from "@supabase/supabase-js";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
}

// Initialize Supabase client for client-side operations
// Safe to use public anon key in client browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

/**
 * Set Supabase session using NextAuth user ID
 * This allows RLS policies to work with NextAuth sessions
 * @param userId User ID from NextAuth session
 * @returns Success status
 */
export async function setSupabaseSession(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      console.error("No user ID provided to set Supabase session");
      return false;
    }

    // Create a custom JWT for Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: userId, // Use the user ID as the access token
      refresh_token: userId, // Also use user ID as refresh token for simplicity
    });
    
    if (error) {
      console.error("Error setting Supabase session:", error);
      return false;
    }
    
    console.log("Successfully set Supabase session for user:", userId);
    return !!data.session;
  } catch (error) {
    console.error("Error in setSupabaseSession:", error);
    return false;
  }
}

// Function to fetch user profile data from Supabase
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, role")
    .eq("id", userId)
    .single();
  
  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data as UserProfile;
}

// Function to update user profile data
export async function updateUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
  const { error } = await supabase
    .from("users")
    .update({
      name: profile.name,
      phone: profile.phone,
      // Do not allow updating role from client-side
    })
    .eq("id", profile.id);
  
  if (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
  
  return true;
}

// Registration helper function
export async function registerUser(
  email: string,
  password: string,
  userData: { 
    name: string;
    phone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Sign up with Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone || null,
          role: "customer", // Default role for new users
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // User created successfully
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred during registration" 
    };
  }
} 