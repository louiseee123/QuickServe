import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    try {
      return await account.get();
    } catch (error) {
      // @ts-expect-error Appwrite error structure
      if (error.code === 401) {
        return null;
      }
      throw error;
    }
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const login = async ({ email, password }: any) => {
    await account.createEmailPasswordSession(email, password);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const logout = async () => {
    await account.deleteSession("current");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    setLocation("/auth");
  };

  const register = async ({ email, password, name }: any) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    await account.createEmailPasswordSession(email, password);
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const loginWithGoogle = () => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}/`,
      `${window.location.origin}/auth?error=google_login_failed`
    );
  };

  const loginMutation = useMutation({ mutationFn: login });
  const logoutMutation = useMutation({ mutationFn: logout });
  const registerMutation = useMutation({ mutationFn: register });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    register: registerMutation.mutateAsync,
    loginWithGoogle,
  };
};

export default useAuth;
