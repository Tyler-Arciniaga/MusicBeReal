import { Redirect, Stack, router } from "expo-router";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

/*
interface User {
  avatar: string | null;
  bio: string | null;
  id: string;
  name: string;
  username: string;
}
*/

const _layout = () => {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
};

const AppLayout = () => {
  const { setAuth, setUserData } = useAuth();
  //const [sessionUser, setSessionUser] = useState<User | null>();

  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      Alert.alert("Profile:", error.message);
    }
    //console.log("User data:", user);

    if (user) {
      const userSupa = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);
      console.log("Fetching user data on initial load:", userSupa.data?.at(0));
      setUserData(userSupa.data?.at(0));
    }
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Session data:", session?.user);

      if (session) {
        setAuth(session?.user);
        fetchUser();

        //don't think you need to replace with tabs route as that is already the default
      } else {
        setAuth(null);
        router.replace("/(auth)");
      }
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default _layout;
