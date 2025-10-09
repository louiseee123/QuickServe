import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ID } from "appwrite";

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

  const login = async ({ email, password }) => {
    await account.createEmailPasswordSession(email, password);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const logout = async () => {
    await account.deleteSession("current");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    setLocation("/auth");
  };

  const register = async ({ email, password, name }) => {
    await account.create(ID.unique(), email, password, name);
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
