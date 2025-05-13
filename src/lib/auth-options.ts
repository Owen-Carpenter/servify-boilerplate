import { NextAuthOptions } from "next-auth";
import { supabase } from "./auth";

// Extend the session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      phone?: string;
      createdAt?: string;
      updatedAt?: string;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        
        // Fetch the latest user data from Supabase
        const { data: userData, error } = await supabase
          .from("users")
          .select("name, email, phone, role, created_at, updated_at")
          .eq("id", token.sub)
          .single();
        
        if (userData && !error) {
          session.user.name = userData.name;
          session.user.email = userData.email;
          session.user.phone = userData.phone;
          session.user.role = userData.role;
          session.user.createdAt = userData.created_at;
          session.user.updatedAt = userData.updated_at;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}; 