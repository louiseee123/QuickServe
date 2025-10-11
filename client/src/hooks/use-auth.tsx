
import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

// More robust and standard way to check user authentication status.
const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // This function now robustly handles all authentication states.
  const getCurrentUser = async () => {
    try {
      // This will throw an error if no session exists, which is expected.
      const session = await account.getSession('current');

      // If a session exists, fetch the user profile from our backend.
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });

      if (!response.ok) {
        // If the backend says the session is bad, delete it on the client.
        await account.deleteSession('current');
        return null; // The user is not authenticated.
      }

      return await response.json(); // Return the authenticated user data.

    } catch (error) {
      // This catch block handles the expected error when no session is found.
      // In this case, the user is simply not logged in.
      return null; // The user is not authenticated.
    }
  };

  // The useQuery hook now fetches the user status. It will always resolve.
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // No need to retry; the function is self-contained.
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      await account.createEmailPasswordSession(email, password);
    },
    onSuccess: () => {
      // After login, refetch the user query to update the app state.
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setLocation("/");
    },
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
    },
    onSuccess: () => {
      // After registration, refetch the user query to log them in.
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setLocation("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await account.deleteSession("current");
    },
    onSuccess: () => {
      // After logout, clear the user data and redirect.
      queryClient.setQueryData(["user"], null);
      setLocation("/login");
    },
  });

  const loginWithGoogle = () => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}/`,
      `${window.location.origin}/auth?error=google_login_failed`
    );
  };

  // Consolidate errors from the login/register mutations.
  const authError = loginMutation.error || registerMutation.error;

  return {
    user,
    isLoading: isUserLoading,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    authError,
    isAdmin: user?.role === 'admin',
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    register: registerMutation.mutate,
    loginWithGoogle,
  };
};

export default useAuth;
