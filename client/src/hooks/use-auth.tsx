
import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useAuth = () => {
  const queryClient = useQueryClient();

  const getCurrentUser = async () => {
    try {
      const session = await account.getSession('current');
      const response = await fetch("/api/me", {
        headers: { 'x-appwrite-session': session.secret },
      });
      if (!response.ok) {
        await account.deleteSession('current');
        return null;
      }
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      await account.createEmailPasswordSession(email, password);
    },
    onSuccess: () => {
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
