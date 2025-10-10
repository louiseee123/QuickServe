import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    try {
      const session = await account.getSession('current');
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });
      if (!response.ok) {
        await account.deleteSession('current');
        throw new Error("Failed to fetch user data (invalid session)");
      }
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const login = async ({ email, password }: any) => {
    try {
      // Step 1: Create a session with Appwrite.
      const session = await account.createEmailPasswordSession(email, password);

      // Step 2: Directly use the new session's secret to fetch our user profile.
      // This avoids the race condition with the browser setting the cookie.
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile after login.");
      }
      
      const user = await response.json();

      // Step 3: Manually put the user data into the cache.
      queryClient.setQueryData(["user"], user);
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      // Clean up on failure to prevent inconsistent states.
      try {
        await account.deleteSession("current");
      } catch (deleteError) {
        console.error("Failed to clear session after login error:", deleteError);
      }
      queryClient.setQueryData(["user"], null);
      throw error; // Re-throw for the mutation's onError.
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      queryClient.setQueryData(["user"], null);
      setLocation("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const register = async ({ email, password, name }: any) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
  };

  const loginWithGoogle = () => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}/`,
      `${window.location.origin}/auth?error=google_login_failed`
    );
  };

  const loginMutation = useMutation({ 
    mutationFn: login,
    onSuccess: (user) => {
      console.log("Login mutation successful, redirecting for user:", user);
      setLocation("/");
    },
    onError: (error) => {
      console.error("Login mutation error:", error);
    }
  });

  const logoutMutation = useMutation({ 
    mutationFn: logout,
    onError: (error) => {
      console.error("Logout mutation error:", error);
    }
  });

  const registerMutation = useMutation({ 
    mutationFn: register,
    onError: (error) => {
      console.error("Registration mutation error:", error);
    }
  });

  const authError = loginMutation.error || registerMutation.error || userError;
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isLoading: isUserLoading,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    authError,
    isAdmin,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    register: registerMutation.mutateAsync,
    loginWithGoogle,
  };
};

export default useAuth;
