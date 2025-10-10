import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    try {
      // This will throw an error if no session exists, which is caught below.
      const session = await account.getSession('current');

      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });
      
      if (!response.ok) {
        // If the backend fails to validate the session, delete the client-side session.
        await account.deleteSession('current');
        throw new Error("Failed to fetch user data (invalid session)");
      }
      
      return await response.json();
    } catch (error) {
      // This block runs if account.getSession throws or if fetching user data fails.
      // In either case, it means there is no valid authenticated user.
      // console.error("No active user session:", error); // Optional: for debugging
      return null;
    }
  };

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const login = async ({ email, password }: any) => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      // Invalidate and refetch user data to update the UI.
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.refetchQueries({ queryKey: ["user"] });
      return session;
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw so the mutation's onError is triggered
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
