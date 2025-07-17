import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import logo from "./../Assets/logocctc.png";
import schoolBg from "./../assets/bgcctc.jpg";
import { Loader2, Eye, EyeOff, ShieldCheck, UserPlus, LockKeyhole } from "lucide-react";

type AuthFormData = {
  username: string;
  password: string;
};

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.15
    }
  }
};

const featureList = [
  {
    title: "Real-time Tracking",
    description: "Monitor your document requests in real-time",
    icon: <ShieldCheck className="h-5 w-5" />
  },
  {
    title: "Secure Processing",
    description: "Military-grade encryption for all documents",
    icon: <LockKeyhole className="h-5 w-5" />
  },
  {
    title: "Instant Notifications",
    description: "Get alerts when your documents are ready",
    icon: <UserPlus className="h-5 w-5" />
  }
];

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const controls = useAnimation();
  const bgControls = useAnimation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    // Start background animations
    bgControls.start({
      x: [0, 100, 0],
      y: [0, 50, 0],
      transition: {
        duration: 120,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }
    });
  }, [user, navigate, bgControls]);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (action: "login" | "register") => {
    setIsSubmitting(true);
    const data = form.getValues();
    
    try {
      // Animate button press
      await controls.start({
        scale: 0.98,
        transition: { duration: 0.1 }
      });
      
      if (action === "login") {
        await login(data.username, data.password);
      } else {
        await register(data.username, data.password);
      }
      
      // Success animation
      await controls.start({
        scale: 1,
        transition: { type: "spring", stiffness: 500 }
      });
      
      navigate("/");
    } catch (error) {
      // Error animation
      await controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.6 }
      });
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (value: "login" | "register") => {
    setActiveTab(value);
    controls.start({
      scale: 0.95,
      transition: { duration: 0.1 }
    });
    setTimeout(() => {
      controls.start({
        scale: 1,
        transition: { type: "spring", stiffness: 400 }
      });
    }, 100);
  };

  return (
    <div className="min-h-screen flex bg-[#0a1a2f] overflow-hidden">
      {/* Left side - Auth form with animated background */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Dynamic background with parallax effect */}
        <motion.div 
          className="absolute inset-0 overflow-hidden z-0"
          animate={bgControls}
        >
          <img
            src={schoolBg}
            alt="School Campus"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-indigo-900/90" />
          
          {/* Animated particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                width: Math.random() * 400 + 100,
                height: Math.random() * 400 + 100,
                opacity: 0.05
              }}
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                transition: {
                  duration: Math.random() * 40 + 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }
              }}
            />
          ))}
        </motion.div>

        {/* Auth card with glass morphism */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-md z-10"
        >
          <Card className="w-full border-0 shadow-2xl bg-white/5 backdrop-blur-lg overflow-hidden border border-white/10">
            {/* Animated accent bar */}
            <motion.div
              className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 w-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
            
            <CardHeader className="text-center space-y-2 pb-6 pt-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <img
                  src={logo}
                  alt="CCTC Logo"
                  className="h-20 mx-auto mb-3"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CardTitle className="text-3xl font-bold text-white tracking-tight">
                  QuickServe Portal
                </CardTitle>
                <CardDescription className="text-blue-200/80 mt-2">
                  Document Request Management System
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => handleTabChange(value as "login" | "register")}
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <TabsList className="grid grid-cols-2 w-full bg-white/5 h-12 relative border border-white/10 rounded-lg">
                    {/* Animated underline */}
                    <motion.div
                      className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-cyan-400",
                        activeTab === "register" ? "left-1/2" : "left-0"
                      )}
                      initial={false}
                      animate={{
                        width: "50%",
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                    />
                    
                    <TabsTrigger 
                      value="login"
                      className="relative z-10 data-[state=active]:text-white data-[state=active]:bg-transparent text-blue-200/80"
                    >
                      <span className={cn(
                        "transition-all duration-300 flex items-center gap-2",
                        activeTab === "login" ? "font-semibold text-white" : "font-medium text-blue-200/80"
                      )}>
                        <LockKeyhole className="h-4 w-4" />
                        Login
                      </span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register"
                      className="relative z-10 data-[state=active]:text-white data-[state=active]:bg-transparent text-blue-200/80"
                    >
                      <span className={cn(
                        "transition-all duration-300 flex items-center gap-2",
                        activeTab === "register" ? "font-semibold text-white" : "font-medium text-blue-200/80"
                      )}>
                        <UserPlus className="h-4 w-4" />
                        Register
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                <div className="mt-8 relative h-72">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute inset-0"
                    >
                      <TabsContent value={activeTab} className="h-full">
                        <Form {...form}>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSubmit(activeTab);
                            }}
                            className="space-y-6 h-full flex flex-col"
                          >
                            <div className="space-y-5">
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white/90 font-medium">
                                      {activeTab === "login" ? "Username" : "Choose a username"}
                                    </FormLabel>
                                    <FormControl>
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                      >
                                        <div className="relative">
                                          <Input 
                                            placeholder={activeTab === "login" ? "Enter your username" : "Choose a username"} 
                                            {...field} 
                                            className="focus-visible:ring-cyan-400 h-12 bg-white/5 border-white/10 text-white pl-10"
                                          />
                                          <UserPlus className="absolute left-3 top-3 h-5 w-5 text-blue-200/60" />
                                        </div>
                                      </motion.div>
                                    </FormControl>
                                    <FormMessage className="text-red-400/90" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white/90 font-medium">
                                      {activeTab === "login" ? "Password" : "Choose a password"}
                                    </FormLabel>
                                    <FormControl>
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                      >
                                        <div className="relative">
                                          <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder={activeTab === "login" ? "Enter your password" : "Choose a password"}
                                            {...field}
                                            className="focus-visible:ring-cyan-400 h-12 bg-white/5 border-white/10 text-white pl-10"
                                          />
                                          <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-blue-200/60" />
                                          <button
                                            type="button"
                                            className="absolute right-3 top-3 text-blue-200/60 hover:text-cyan-400 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                          >
                                            {showPassword ? (
                                              <EyeOff className="h-5 w-5" />
                                            ) : (
                                              <Eye className="h-5 w-5" />
                                            )}
                                          </button>
                                        </div>
                                      </motion.div>
                                    </FormControl>
                                    <FormMessage className="text-red-400/90" />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mt-auto"
                            >
                              <motion.div
                                animate={controls}
                              >
                                <Button 
                                  type="submit" 
                                  className={cn(
                                    "w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
                                    "text-white font-medium shadow-lg hover:shadow-xl transition-all",
                                    "relative overflow-hidden group"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <span className="relative z-10 flex items-center gap-2">
                                        {activeTab === "login" ? (
                                          <>
                                            <LockKeyhole className="h-5 w-5" />
                                            Sign In
                                          </>
                                        ) : (
                                          <>
                                            <UserPlus className="h-5 w-5" />
                                            Create Account
                                          </>
                                        )}
                                      </span>
                                      <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </motion.div>
                          </form>
                        </Form>
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Premium hero section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-b from-[#0a1a2f] to-[#0c1120] relative overflow-hidden border-l border-white/10">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.2, 0.8, 0.2],
                transition: {
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            />
          ))}
        </div>
        
        <div className="flex flex-col justify-center px-12 max-w-2xl text-white z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 w-32 h-32 flex items-center justify-center mb-8 mx-auto"
            >
              <img
                src={logo}
                alt="CCTC Logo"
                className="w-full h-full object-contain p-3"
              />
            </motion.div>
            <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
              Welcome to <br />Consolatrix College
            </h2>
            <p className="text-lg text-blue-200 mb-10">
              Experience seamless document processing with our next-generation request system.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {featureList.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="flex items-start gap-5 group"
              >
                <div className="bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-400/20 group-hover:bg-cyan-500/20 transition-colors mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-blue-200/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating help text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16 bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm"
          >
            <p className="text-blue-200/80 text-sm">
              Need help? Contact our support team at 
              <span className="text-cyan-400 ml-1">support@cctc.edu.ph</span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}