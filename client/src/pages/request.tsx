import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertRequestSchema, type InsertRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowRight, CheckCircle, HelpCircle, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Nav from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logocctc.png";

const documentTypes = [
  "Transcript of Records",
  "Certification",
  "Form 137",
  "Diploma",
  "Good Moral Certificate",
];

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const courses = [
  "Bachelor of Science in Information Technology",
  "Bachelor of Science in Computer Science",
  "Bachelor of Elementary Education",
  "Bachelor of Secondary Education",
  "Bachelor of Science in Business Administration",
  "Bachelor of Science in Accountancy",
];

const steps = [
  {
    title: "Fill out the form",
    description: "Provide your details and document requirements",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Review your request",
    description: "Double-check all information before submitting",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    title: "Get confirmation",
    description: "Receive your queue number and tracking details",
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

export default function Request() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const form = useForm<InsertRequest>({
    resolver: zodResolver(insertRequestSchema),
    defaultValues: {
      studentId: user?.studentId || "",
      studentName: user?.name || "",
      yearLevel: "",
      course: "",
      email: user?.email || "",
      documentType: "",
      purpose: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertRequest) => {
      const res = await apiRequest("POST", "/api/requests", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Submitted Successfully!",
        description: `Your queue number is #${data.queueNumber}. You'll receive updates via email.`,
      });
      navigate("/my-requests");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "Please try again later",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Nav />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-12"
      >
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16 text-center pt-16"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-8"
            >
              <img src={logo} alt="CCTC Logo" className="h-24 mx-auto" />
            </motion.div>
            
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                Document Request Portal
              </h1>
              
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Request your official academic documents from CCTC with our streamlined process
              </p>
            </div>
          </motion.section>

          {/* Process Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-70"></div>
                      <div className="relative bg-white p-4 rounded-full shadow-sm border border-blue-100">
                        <div className="bg-blue-600 p-3 rounded-full text-white">
                          {step.icon}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 right-0 left-full transform -translate-y-1/2">
                          <ChevronRight className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Request Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Document Request Form</h2>
                    <p className="text-blue-100 mt-1">Please fill out all required fields</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit((data) => mutation.mutate(data))} 
                    className="space-y-8"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Student ID</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 pl-10 h-12"
                                  placeholder="2023-12345"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                  </svg>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 pl-10 h-12"
                                  placeholder="Juan M. Dela Cruz"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                  </svg>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Year Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <div className="relative">
                                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 pl-10 h-12 text-left">
                                    <SelectValue placeholder="Select year level" />
                                  </SelectTrigger>
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                              <SelectContent className="bg-white border-gray-200 shadow-lg">
                                {yearLevels.map((year) => (
                                  <SelectItem 
                                    key={year} 
                                    value={year}
                                    className="hover:bg-blue-50 focus:bg-blue-50"
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="course"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Course/Program</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <div className="relative">
                                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 pl-10 h-12 text-left">
                                    <SelectValue placeholder="Select your course" />
                                  </SelectTrigger>
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                              <SelectContent className="bg-white border-gray-200 shadow-lg">
                                {courses.map((course) => (
                                  <SelectItem 
                                    key={course} 
                                    value={course}
                                    className="hover:bg-blue-50 focus:bg-blue-50"
                                  >
                                    {course}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="email" 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 pl-10 h-12"
                                  placeholder="your.email@example.com"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Document Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <div className="relative">
                                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 pl-10 h-12 text-left">
                                    <SelectValue placeholder="Select document type" />
                                  </SelectTrigger>
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line x1="16" y1="13" x2="8" y2="13"></line>
                                      <line x1="16" y1="17" x2="8" y2="17"></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                              <SelectContent className="bg-white border-gray-200 shadow-lg">
                                {documentTypes.map((type) => (
                                  <SelectItem 
                                    key={type} 
                                    value={type}
                                    className="hover:bg-blue-50 focus:bg-blue-50"
                                  >
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Purpose</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                {...field}
                                className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 min-h-[120px] pl-10"
                                placeholder="Please provide a detailed purpose for requesting this document (e.g., For employment, scholarship application, etc.)"
                              />
                              <div className="absolute top-4 left-3 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="16" x2="12" y2="12"></line>
                                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4"
                    >
                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.01]"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Request...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Submit Request 
                            <motion.span
                              initial={{ x: 0 }}
                              animate={{ x: 4 }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatType: "reverse", 
                                duration: 0.8 
                              }}
                            >
                              <ArrowRight className="h-5 w-5" />
                            </motion.span>
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="inline-block bg-white/80 backdrop-blur-sm px-8 py-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Need help with your request?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our registrar's office is happy to assist you with any questions about document requests.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  registrar@cctc.edu.ph
                </Button>
                <Button variant="outline" className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  (032) 123-4567
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}