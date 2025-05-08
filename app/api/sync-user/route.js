import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

// This API route manually syncs user data from Clerk to Supabase
export async function POST(req) {
  try {
    // Get the current user from Clerk
    const { userId } = auth();
    
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user data from the request
    const userData = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient();

    // Upsert user data to Supabase users table
    const { error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username || userData.email.split('@')[0],
          avatar_url: userData.imageUrl,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Error syncing user to Supabase:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in sync-user API route:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
