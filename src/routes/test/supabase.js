import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://zqgaofwvzislmquhoick.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZ2FvZnd2emlzbG1xdWhvaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE1NTQzMDksImV4cCI6MTk4NzEzMDMwOX0._bwuhHkbU_Wr7FuK7QlGApTrHHltK05Zs7lOycAfW4c"
);