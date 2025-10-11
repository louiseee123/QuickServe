
import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    // Let this throw if no session exists. The query will handle the error.
    const session = await account.getSession('current');

    // Use the session to fetch our own backend's user data
    const response = await fetch("/api/me", {
      headers: { 'x-appwrite-session': session.secret },
    });

    if (!response.ok) {
      // Don't delete the session here. Just signal that the fetch failed.
      // The onError handler of the query will handle the session cleanup.
      throw new Error("Failed to fetch user data (session may be invalid or expired)");
    }
    return await response.json();
  };

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on failure, to prevent loops.
    refetchOnWindowFocus: false, // Disable refetch on focus to prevent loops.
    onError: async () => {
      // This is the correct place for side-effects in response to a query failure.
      // If fetching the user fails, it means our session is bad. Clean it up.
      try {
        await account.deleteSession('current');
      } finally {
        // Ensure the user data is cleared from the cache.
        queryClient.setQueryData(['user'], null);
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      await account.createEmailPasswordSession(email, password);
    },
    onSuccess: () => {
      // Don't set data manually. Invalidate the query to force a clean refetch.
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setLocation("/");
    },
    onError: (error: any) => {
      // The component will display this error. No need to re-throw.
      console.error("Login failed:", error);
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
        // The server now returns a session, so we can invalidate to refetch.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setLocation("/");
    },
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

  const authError = loginMutation.error || registerMutation.error || userError;

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
