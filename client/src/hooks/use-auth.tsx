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
      if (!response.ok) throw new Error("Failed to fetch user data");
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  const login = async ({ email, password }: any) => {
    await account.createEmailPasswordSession(email, password);
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const logout = async () => {
    await account.deleteSession("current");
    queryClient.setQueryData(["user"], null);
    setLocation("/auth");
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
    
    await login({ email, password });
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
    onSuccess: () => setLocation("/"),
  });

  const logoutMutation = useMutation({ mutationFn: logout });

  const registerMutation = useMutation({ 
    mutationFn: register,
    onSuccess: () => setLocation("/"),
  });

  const authError = loginMutation.error || registerMutation.error;
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
