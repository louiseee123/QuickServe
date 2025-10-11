
import useAuth from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import qslogo from "./../Assets/QSLogo.png";
import schoolBg from "./../Assets/bgcctc.jpg";
import { Loader2, Eye, EyeOff, ShieldCheck, UserPlus, LockKeyhole, Mail, HelpCircle, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import packageJson from "./../../../package.json";

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

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, { message: "Passwords do not match", path: ["confirmPassword"] });

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const { 
    login,
    register, 
    isLoggingIn, 
    isRegistering, 
    authError,
    loginWithGoogle,
    forceLogout
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const controls = useAnimation();
  const bgControls = useAnimation();
  const { toast } = useToast();
  const version = packageJson.version;

  useEffect(() => {
    bgControls.start({
      scale: [1, 1.05, 1],
      transition: {
        duration: 90,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    });
  }, [bgControls]);

  useEffect(() => {
    if (authError) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.6, type: "spring", stiffness: 500 }
      });
      form.setValue("password", "");
      form.setValue("confirmPassword", "");
    }
  }, [authError, controls]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (values: AuthFormValues) => {
    if (activeTab === "login") {
      login({ email: values.email, password: values.password });
    } else {
      register({ name: values.name, email: values.email, password: values.password });
    }
  };
  
  const handleGoogleSignIn = () => {
    loginWithGoogle();
  };

  const handleTabChange = (value: string | null) => {
    if (value === "login" || value === "register") {
      setActiveTab(value);
      form.reset();
      form.clearErrors();
    }
  };

  const handleForceLogout = async () => {
    await forceLogout();
    toast({ title: "Success", description: "Any stuck session has been cleared. Please try logging in again." });
    setShowHelp(false);
  };
  
  const isSubmitting = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen flex bg-[#0a1a2f] overflow-hidden relative">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-6 right-6 z-50 bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-full shadow-lg transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="h-6 w-6" />
      </motion.button>

       <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-6 z-50 bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 max-w-xs shadow-2xl"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-cyan-400" />
              Login Issues?
            </h3>
            <p className="text-blue-200 text-sm mb-4">
              If you\'re stuck in a login loop, click the button below to force a logout and clear any stuck sessions.
            </p>
            <Button onClick={handleForceLogout} className="w-full bg-red-600 hover:bg-red-700 text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Force Logout
            </Button>
            <p className="text-xs text-blue-300/50 mt-4 text-center">Version {version}</p>
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 text-blue-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden min-h-screen">
        <motion.div 
          className="absolute inset-0 overflow-hidden z-0"
        >
          <motion.img
            src={schoolBg}
            alt="School Campus"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
            animate={bgControls}
            style={{ transform: "scale(1.1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-indigo-900/90" />
          
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                opacity: 0.05
              }}
              animate={{
                x: [0, Math.random() * 150 - 75],
                y: [0, Math.random() * 150 - 75],
                transition: {
                  duration: Math.random() * 30 + 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-md z-10"
        >
          <Card className="w-full border-0 shadow-2xl bg-white/5 backdrop-blur-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
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
                  src={qslogo}
                  alt="QuickServe Logo"
                  className="h-20 mx-auto mb-3"
                  loading="eager"
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
                  Secure Document Request System
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange}
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <TabsList className="grid grid-cols-2 w-full bg-white/5 h-12 relative border border-white/10 rounded-lg">
                    <motion.div
                      className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-cyan-400",
                        activeTab === "register" ? "left-1/2" : "left-0"
                      )}
                      initial={false}
                      animate={{
                        width: "50%",
                        left: activeTab === "login" ? "0%" : "50%",
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

                <div className="mt-8 relative"> 
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <TabsContent value={activeTab} forceMount>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-6 flex flex-col"
                          >
                            <div className="space-y-5">
                              {activeTab === "register" && (
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel htmlFor="name" className="text-white/90 font-medium">
                                        Full Name
                                      </FormLabel>
                                      <FormControl>
                                        <motion.div
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.1 }}
                                        >
                                          <div className="relative">
                                            <Input
                                              id="name"
                                              placeholder="Enter your full name" 
                                              {...field} 
                                              className="focus-visible:ring-cyan-400 h-12 bg-white/5 border-white/10 text-white pl-10 hover:border-white/20 transition-colors"
                                              autoComplete="name"
                                            />
                                            <User className="absolute left-3 top-3 h-5 w-5 text-blue-200/60" />
                                          </div>
                                        </motion.div>
                                      </FormControl>
                                      <FormMessage className="text-red-400/90" />
                                    </FormItem>
                                  )}
                                />
                              )}
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="email" className="text-white/90 font-medium">
                                      Email Address
                                    </FormLabel>
                                    <FormControl>
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                      >
                                        <div className="relative">
                                          <Input
                                            id="email"
                                            placeholder="Enter your email" 
                                            {...field} 
                                            className="focus-visible:ring-cyan-400 h-12 bg-white/5 border-white/10 text-white pl-10 hover:border-white/20 transition-colors"
                                            autoComplete="email"
                                          />
                                          <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-200/60" />
                                        </div>
                                      </motion.div>
                                    </FormControl>
                                    <FormMessage className="text-red-400/90" />
                                  </FormItem>
                                )}/>
                              <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel htmlFor="password" className="text-white/90 font-medium">
                                      {activeTab === "login" ? "Password" : "Choose a password"}
                                    </FormLabel>
                                    <FormControl>
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                      >
                                        <div className="relative">
                                          <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder={activeTab === "login" ? "Enter your password" : "Choose a password"}
                                            {...field}
                                            className="focus-visible:ring-cyan-400 h-12 bg-white/5 border-white/10 text-white pl-10 hover:border-white/20 transition-colors"
                                            autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                                          />
                                          <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-blue-200/60" />
                                          <button
                                            type="button"
                                            className="absolute right-3 top-3 text-blue-200/60 hover:text-cyan-400 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
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
                                )}/>
                              {activeTab === "register" && (
                                <FormField
                                  control={form.control}
                                  name="confirmPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel htmlFor="confirmPassword" className="text-white/90 font-medium">
                                        Confirm Password
                                      </FormLabel>
                                      <FormControl>
                                        <motion.div
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.4 }}
                                        >
                                          <div className="relative">
                                            <Input
                                              id="confirmPassword"
                                              type={showConfirmPassword ? "text" : "password"}
                                              placeholder="Confirm your password"
                                              {...field}
                                              className="focus-visible:ring-cyan-400 h-12 bg-white/5 border-white/10 text-white pl-10 hover:border-white/20 transition-colors"
                                              autoComplete="new-password"
                                            />
                                            <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-blue-200/60" />
                                            <button
                                              type="button"
                                              className="absolute right-3 top-3 text-blue-200/60 hover:text-cyan-400 transition-colors"
                                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                              {showConfirmPassword ? (
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
                              )}
                            </div>
                            
                             {authError && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400/90 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center text-sm font-medium"
                              >
                                {(authError as Error).message}
                              </motion.div>
                            )}
                            
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="mt-auto"
                            >
                              <motion.div
                                animate={controls}
                                className={activeTab === 'register' ? "grid grid-cols-2 gap-4" : ""}
                              >
                                <Button 
                                  type="submit" 
                                  className={cn(
                                    "w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
                                    "text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300",
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
                                      <span className="relative z-10 flex items-center justify-center gap-2">
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
                                
                                <Button 
                                  type="button"
                                  variant="outline"
                                  onClick={handleGoogleSignIn}
                                  className={cn(
                                    "w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2",
                                    activeTab === 'login' ? "mt-4" : ""
                                  )}
                                  disabled={isSubmitting}
                                >
                                  <img src="https://www.google.com/favicon.ico" alt="Google logo" className="h-5 w-5" />
                                  {activeTab === "login" ? "Sign in with Google" : "Google"}
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

      <div className="hidden lg:flex flex-1 bg-gradient-to-b from-[#0a1a2f] to-[#0c1120] relative overflow-hidden border-l border-white/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
          
          {[...Array(15)].map((_, i) => (
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
                y: [0, Math.random() * 80 - 40],
                x: [0, Math.random() * 80 - 40],
                opacity: [0.2, 0.8, 0.2],
                transition: {
                  duration: Math.random() * 15 + 10,
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
                loading="eager"
              />
            </motion.div>
            <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
              Welcome to <br />CCTC\'s QuickServe
            </h2>
            <p className="text-lg text-blue-200 mb-10">
              Experience seamless document processing with our new request system.
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
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-400/20 group-hover:bg-cyan-500/20 transition-colors mt-1"
                >
                  {feature.icon}
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-blue-200/80 group-hover:text-blue-100 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-24 bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm"
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
