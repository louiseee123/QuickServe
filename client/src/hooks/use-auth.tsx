
import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useAuth = () => {
  const queryClient = useQueryClient();

  // The query function now throws an error on failure, which is necessary for retries.
  const getCurrentUser = async () => {
    try {
      const session = await account.getSession('current');
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });

      if (!response.ok) {
        // Throwing an error will trigger react-query's retry mechanism.
        // This is the key change to fix the race condition.
        throw new Error('Failed to fetch user data from server.');
      }
      return await response.json();
    } catch (error) {
      // Re-throw the error so react-query knows the query failed.
      throw error;
    }
  };

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    // Retry the query 3 times with an exponential backoff delay if it fails.
    // This gives the server-side session time to become available.
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000), // 1s, 2s, 4s
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      await account.createEmailPasswordSession(email, password);
    },
    onSuccess: () => {
      // After a successful login, invalidate the user query to refetch it.
      // The refetch will now benefit from the retry logic.
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await account.deleteSession("current");
    },
    onSuccess: () => {
      // When logging out, we don't need to refetch, just clear the user data.
      queryClient.setQueryData(["user"], null);
    },
  });

  const loginWithGoogle = () => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}/`,
      `${window.location.origin}/auth?error=google_login_failed`
    );
  };

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
