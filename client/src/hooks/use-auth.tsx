import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    try {
      // Better session checking
      const sessions = await account.getSessions();
      if (sessions.sessions.length === 0) {
        return null;
      }

      const session = await account.getSession('current');
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });
      
      if (!response.ok) {
        // If the session is invalid, clear it
        await account.deleteSession('current');
        throw new Error("Failed to fetch user data");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error getting current user:", error);
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
      console.log("Attempting login with:", email);
      const session = await account.createEmailPasswordSession(email, password);
      console.log("Login successful, session:", session);
      
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.refetchQueries({ queryKey: ["user"] });
      
      return session;
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw so mutation can catch it
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
    onSuccess: () => {
      console.log("Login mutation successful, redirecting...");
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
    login: loginMutation.mutateAsync, // This returns a promise
    logout: logoutMutation.mutate,
    register: registerMutation.mutateAsync, // This returns a promise
    loginWithGoogle,
  };
};

export default useAuth;