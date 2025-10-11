
import { account } from "../lib/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID } from "appwrite";

const useAuth = () => {
  const queryClient = useQueryClient();

  const getCurrentUser = async () => {
    try {
      const user = await account.get();
      let prefs = await account.getPrefs();

      // If the user is logged in but has no role in their preferences,
      // assign them the 'user' role by default.
      if (!prefs.role) {
        prefs = await account.updatePrefs({ ...prefs, role: 'user' });
      }

      return { ...user, ...prefs };

    } catch (error: any) {
      // This error is expected for guest users who are not logged in.
      // We'll ignore the 401 "missing scopes" error to avoid confusion in the console.
      if (error.code !== 401) {
          console.error("Failed to fetch user:", error);
      }
      return null;
    }
  };

  const { data: user, isLoading: isUserLoading, isFetching: isUserFetching } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
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
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      // New users are explicitly given the 'user' role.
      await account.updatePrefs({ role: 'user' });
    },
    onSuccess: (data, variables, context) => {
      const onSuccess = (context as any)?.onSuccess;
      if (onSuccess) {
        onSuccess(data);
      }
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

  const forceLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      // Ignore errors if no session is found
    } finally {
      queryClient.setQueryData(['user'], null);
    }
  };

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
    isLoading: isUserLoading || isUserFetching,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    authError,
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    register: (vars: any, options: any) => registerMutation.mutate(vars, options),
    loginWithGoogle,
    forceLogout,
  };
};

export default useAuth;
