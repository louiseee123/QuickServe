import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    try {
      // This will throw an error if no session exists
      const session = await account.getSession('current');
      // Use the session to fetch our own backend's user data
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });
      if (!response.ok) {
        // If our backend says the session is invalid, delete it client-side
        await account.deleteSession('current');
        throw new Error("Failed to fetch user data (session is invalid or expired)");
      }
      return await response.json();
    } catch (error) {
      // This is an expected error when the user is not logged in
      return null;
    }
  };

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on initial load
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      // Forcefully delete any existing session to prevent "session active" errors.
      try {
        await account.deleteSession('current');
      } catch (error) {
        // Ignore errors if no session exists, we only care about cleaning up a stuck one.
      }
      try {
        const session = await account.createEmailPasswordSession(email, password);
        const response = await fetch("/api/me", {
          headers: { 'x-appwrite-session': session.secret },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user profile after login.");
        }
        return await response.json();
      } catch (error: any) {
        // Consolidate error messages for the UI
        const errorMessage = error?.response?.message || error?.message || "Invalid email or password.";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      setLocation("/");
    },
    // Let the component handle onError display
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, name }: any) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return { email, password }; // Pass credentials for auto-login
    },
    onSuccess: (data) => {
      // Automatically log the user in after successful registration
      loginMutation.mutate(data);
    },
    // Let the component handle onError display
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await account.deleteSession("current");
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      setLocation("/auth");
    },
  });

  const loginWithGoogle = () => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}/`,
      `${window.location.origin}/auth?error=google_login_failed`
    );
  };

  // This single error state will now correctly capture failures from any mutation
  const authError = loginMutation.error || registerMutation.error;

  return {
    user,
    isLoading: isUserLoading,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    authError,
    isAdmin: user?.role === 'admin',

    // Expose the synchronous `mutate` functions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
register: registerMutation.mutate,

    loginWithGoogle,
  };
};

export default useAuth;