import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Type extensions for role-based access
declare module "next-auth" {
  interface User {
    role?: string;
    phone?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      phone?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    phone?: string;
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Create NextAuth handler with explicit exports
const handler = NextAuth({
  // Authentication providers: OAuth and credentials
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials:", { email: !!credentials?.email, password: !!credentials?.password });
          return null;
        }

        try {
          console.log("Attempting Supabase login for:", credentials.email);
          
          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase auth error:", error.message, error);
            return null;
          }

          if (!data?.user) {
            console.error("No user returned from Supabase");
            return null;
          }

          console.log("Supabase login successful, user ID:", data.user.id);
          
          // Get user profile from users table
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("id, name, email, phone, role")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            
            // User exists in auth but not in users table, create a profile
            if (profileError.code === 'PGRST116') { // No rows returned
              console.log("User profile not found, creating one");
              
              const newProfile = {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || null,
                email: data.user.email,
                phone: data.user.user_metadata?.phone || null,
                role: "customer", // Default role
              };
              
              const { error: insertError } = await supabase
                .from("users")
                .insert(newProfile);
                
              if (insertError) {
                console.error("Error creating user profile:", insertError);
              } else {
                console.log("Created user profile successfully");
                // Use the newly created profile
                return {
                  id: data.user.id,
                  email: data.user.email,
                  name: newProfile.name,
                  phone: newProfile.phone,
                  role: newProfile.role,
                };
              }
            }
          }

          // Return user with role information
          return {
            id: data.user.id,
            email: data.user.email,
            name: profile?.name || data.user.email?.split('@')[0] || null,
            phone: profile?.phone || null,
            role: profile?.role || "customer", // Default role
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  
  // Use JWT for session management
  session: {
    strategy: "jwt",
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  callbacks: {
    // Add role to JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "customer";
        token.phone = user.phone || "";
      }
      return token;
    },
    // Pass role to client session
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    // Handle redirects after sign-in
    async redirect({ url, baseUrl }) {
      // If the URL is already absolute (starts with http/https), use it
      if (url.startsWith('http')) return url;
      
      // If it's a relative path, join it with the base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Default redirect to services page after successful sign-in
      if (url === baseUrl) return `${baseUrl}/services`;
      
      // Default fallback - return to the base URL
      return baseUrl;
    },
  },
  
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
  },
  
  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
});

// Export the handler directly for Next.js App Router
export const GET = handler;
export const POST = handler;
