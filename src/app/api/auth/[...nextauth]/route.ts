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
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
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
          return null;
        }

        try {
          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            console.error("Auth error:", error?.message);
            return null;
          }

          // Get user profile from users table
          const { data: profile } = await supabase
            .from("users")
            .select("id, name, email, phone, role")
            .eq("id", data.user.id)
            .single();

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
  
  callbacks: {
    // Add role to JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "customer";
      }
      return token;
    },
    // Pass role to client session
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub;
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
