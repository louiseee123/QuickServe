import { account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const getCurrentUser = async () => {
    try {
      return await account.get();
    } catch (error) {
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
    queryClient.invalidateQueries(["user"]);
  };

  const logout = async () => {
    await account.deleteSession("current");
    queryClient.invalidateQueries(["user"]);
    setLocation("/auth");
  };

  const register = async ({ email, password, name }) => {
    await account.create(ID.unique(), email, password, name);
    await login({ email, password });
  };

  const loginMutation = useMutation({ mutationFn: login });
  const logoutMutation = useMutation({ mutationFn: logout });
  const registerMutation = useMutation({ mutationFn: register });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    register: registerMutation.mutate,
  };
};

export default useAuth;
