import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { auth, db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let role = 'user'; // Default role
        if (userDoc.exists()) {
          role = userDoc.data().role || 'user';
        }

        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          role,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const createUser = httpsCallable(functions, "createUser");
      await createUser({ email, password, role: "user" });

      toast({ title: "Account created successfully!" });
    } catch (error: any) {
      setError(error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user role from Firestore immediately after login
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let role = 'user'; // Default role
      if (userDoc.exists()) {
        role = userDoc.data().role || 'user';
      }
      
      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
      };

      setUser(appUser);
      toast({ title: "Welcome back!" });
    } catch (error: any) {
      setError(error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully" });
    } catch (error: any) {
      setError(error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
