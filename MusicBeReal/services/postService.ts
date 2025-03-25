import { supabase } from "@/lib/supabase";
//will probably eventually need to have other services for uploading album cover

interface Song {
  name: string;
  artist: string;
  uri: string;
  preview_url: string | null;
  cover: string;
}

interface like {
  user_id: string;
  post_id: string;
}

export const createPost = async (song: Song) => {
  try {
    const { data, error } = await supabase
      .from("song_posts")
      .insert(song)
      .select()
      .single();
    if (error) {
      console.log("Error upserting post to Supabase:", error);
      return { success: false, msg: "Could not create post" };
    }
    return { sucess: true, data: data };
  } catch (error) {
    console.log("Error posting song:", error);
    return { success: false, msg: "Could not create post" };
  }
};

export const fetchPosts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("song_posts")
      .select(`*, postLikes(*)`) //fetch each post and it's associated likes
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      return { success: false, msg: "Could not fetch post" };
    }
    return { sucess: true, data: data };
  } catch (error) {
    return { success: false, msg: "Could not fetch post" };
  }
};

export const fetchMorePosts = async (lastSondId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("song_posts")
      .select("*")
      .lt("id", lastSondId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      //console.log("Error fetching post from Supabase:", error);
      return { success: false, msg: "Could not fetch post" };
    }
    return { sucess: true, data: data };
  } catch (error) {
    //console.log("Error fetching posts:", error);
    return { success: false, msg: "Could not fetch post" };
  }
};

export const createPostLike = async (like: like) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(like)
      .select()
      .single();

    if (error) {
      console.log("Error creating post like on Supabase", error);
      return { success: false, msg: "Could not like post" };
    } else {
      return { sucess: true, data: data };
    }
  } catch (err) {
    console.log("Error:", err);
    return { success: false, msg: "Could not like post" };
  }
};
