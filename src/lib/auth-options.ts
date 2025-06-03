import { NextAuthOptions } from "next-auth";
import { supabase } from "./auth";

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
          // Note: createdAt and updatedAt are not available in the Session type
          // session.user.createdAt = userData.created_at;
          // session.user.updatedAt = userData.updated_at;
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