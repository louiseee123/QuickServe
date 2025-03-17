import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthFormData = {
  username: string;
  password: string;
};

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, login, register } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (action: "login" | "register") => {
    const data = form.getValues();
    try {
      if (action === "login") {
        await login(data.username, data.password);
      } else {
        await register(data.username, data.password);
      }
      navigate("/");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="mb-8">
              <img
                src=".png"
                alt="CCTC Logo"
                className="h-24 mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-center">
                Welcome to QuickServe
              </h1>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Sign in to manage your document requests
              </p>
            </div>

            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit("login");
                    }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit("register");
                    }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Choose a password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-primary/10">
        <div className="flex flex-col justify-center px-12 max-w-2xl">
          <img
            src="/logo.png"
            alt="CCTC Logo"
            className="w-32 h-32 mb-8"
          />
          <h2 className="text-4xl font-bold mb-4">
            Welcome, Consolatricians!
          </h2>
          <p className="text-lg text-muted-foreground">
            Streamline your document requests with QuickServe - CCTC's efficient
            queue management system. Get your academic documents faster and easier
            than ever before.
          </p>
        </div>
      </div>
    </div>
  );
}