import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateUserProfile } from "@/lib/auth";

// This endpoint is for updating the user's profile
export async function PUT(req: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    
    // In a real application, you would update the user in your database
    if (session.user.id) {
      const updateSuccess = await updateUserProfile({
        id: session.user.id,
        name: data.name,
        phone: data.phone,
      });
      
      if (!updateSuccess) {
        throw new Error("Failed to update profile in database");
      }
    }
    
    // Return the updated user data
    const updatedUser = {
      ...session.user,
      ...data,
    };
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch profile data
export async function GET() {
  try {
    // Check if the user is authenticated
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // In a real application, you would fetch the user from your database
    // For example with Supabase:
    // const user = await getUserProfile(session.user.id);
    
    // Return the user data
    return NextResponse.json({
      success: true,
      user: session.user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
} 