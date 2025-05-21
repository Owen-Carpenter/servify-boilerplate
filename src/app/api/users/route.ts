import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    // Get the current session to check if user is authenticated
    const session = await getServerSession();
    
    // TEMPORARY: Allowing all authenticated users to access this endpoint
    // In production, you should properly implement role-based authentication
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required.' 
      }, { status: 401 });
    }
    
    // Admin role check is temporarily disabled
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ 
    //     success: false, 
    //     message: 'Unauthorized. Admin access required.' 
    //   }, { status: 403 });
    // }
    
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build the query - only select fields we know exist in the database
    // Based on the SQL schema we saw, these are the fields we know exist
    let query = supabase
      .from('users')
      .select('id, name, email, phone, role, created_at', { count: 'exact' });
    
    // Apply filters if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    if (role) {
      query = query.eq('role', role);
    }
    
    // Apply pagination
    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ 
        success: false, 
        message: `Error fetching users: ${error.message}` 
      }, { status: 500 });
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    // Return the users data with pagination info
    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in users API:', error);
    return NextResponse.json({ 
      success: false, 
      message: `An unexpected error occurred: ${errorMessage}` 
    }, { status: 500 });
  }
} 