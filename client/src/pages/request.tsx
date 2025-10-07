import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Document, DocumentRequest, InsertRequest, DocumentInsert } from "@shared/schema";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithAuth } from "../lib/api";
import { FilePlus, User, CheckSquare } from 'lucide-react';
import "./request.css";

// --- Constants for Dropdowns ---
const courses = [
  { acronym: "BSIT", name: "Bachelor of Science in Information Technology" },
  { acronym: "BSHM", name: "Bachelor of Science in Hospitality Management" },
  { acronym: "BEED", name: "Bachelor of Elementary Education" },
  { acronym: "BSED", name: "Bachelor of Secondary Education" },
  { acronym: "BPED", name: "Bachelor of Physical Education" },
];

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Irregular"];

interface SelectedDocument extends Document {
  details?: string;
}

export default function Request() {
  const { user, token } = useAuth();
  // --- State Management ---
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<Map<number, SelectedDocument>>(new Map());

  const [, setLocation] = useLocation();

  // --- Data Fetching ---
  const { data: availableDocuments = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // --- API Mutation ---
  const mutation = useMutation<DocumentRequest, any, InsertRequest>({
    mutationFn: async (newRequest) => {
      if (!token) throw new Error("Authentication token not found.");
      const response = await fetch("/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newRequest),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData; 
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Request submitted! Redirecting to checkout...");
      setLocation(`/checkout/${data.id}`);
    },
    onError: (error) => {
      const message = error.error || error.message || "An unexpected error occurred.";
      toast.error(message);
    }
  });

  // --- Event Handlers ---
  const handleDocSelection = (doc: Document, isSelected: boolean) => {
    setSelectedDocs(prev => {
      const newMap = new Map(prev);
      if (isSelected) {
        newMap.set(doc.id, { ...doc, details: '' });
      } else {
        newMap.delete(doc.id);
      }
      return newMap;
    });
  };

  const handleDocDetailsChange = (docId: number, details: string) => {
    setSelectedDocs(prev => {
      const newMap = new Map(prev);
      const doc = newMap.get(docId);
      if (doc) {
        newMap.set(docId, { ...doc, details });
      }
      return newMap;
    });
  };
  
  // --- Memoized Calculations ---
  const { totalAmount, totalProcessingDays } = useMemo(() => {
    let amount = 0;
    let days = 0;
    for (const doc of selectedDocs.values()) {
      amount += doc.price;
      days += Math.max(doc.processingTimeDays || 0, 1);
    }
    return { totalAmount: amount, totalProcessingDays: Math.max(days, 1) };
  }, [selectedDocs]);

  const isFormValid = useMemo(() => {
    return studentName && studentId && email && course && yearLevel && purpose && selectedDocs.size > 0;
  }, [studentName, studentId, email, course, yearLevel, purpose, selectedDocs]);

  // --- Submit Handler ---
  const handleRequest = () => {
    if (!isFormValid) {
        toast.error("Please fill out all required fields before submitting.");
        return;
    }
    
    if (!user) {
      toast.error("You must be logged in to make a request.");
      return;
    }

    const documents: DocumentInsert[] = Array.from(selectedDocs.values()).map(doc => ({
      name: doc.name,
      details: (doc.name === 'Certification' || doc.name === 'Others') ? doc.details : undefined,
      price: doc.price, 
      processingTimeDays: Math.max(doc.processingTimeDays || 0, 1),
    }));
    
    const newRequest: InsertRequest = {
      studentName, 
      studentId, 
      email, 
      course, 
      yearLevel, 
      purpose,
      totalAmount: totalAmount,
      estimatedCompletionDays: totalProcessingDays,
      userId: user.id,
      documents,
    };
    
    mutation.mutate(newRequest);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 modern-form">
      <main className="container mx-auto pt-32 px-4 pb-16 flex flex-col items-center">
        {/* 3-Step Guide */}
        <div className="w-full max-w-5xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-800">Step 1: Fill in your Details</h3>
                    <p className="text-sm text-gray-600">Provide your personal and academic information.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                        <FilePlus className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-800">Step 2: Select Documents</h3>
                    <p className="text-sm text-gray-600">Choose the documents you need and specify any details.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                        <CheckSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-800">Step 3: Review and Submit</h3>
                    <p className="text-sm text-gray-600">Verify your request and submit it for processing.</p>
                </div>
            </div>
        </div>

        <Card className="w-full max-w-4xl bg-white shadow-xl rounded-2xl border border-gray-200/80">
          <CardHeader className="text-center p-8">
             <CardTitle className="text-3xl font-bold text-blue-600">Request a Document</CardTitle>
             <CardDescription className="text-gray-600 pt-2 text-base">Complete the form below to submit your document request.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* Student Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 pb-8 border-b border-gray-200">
              <div className="space-y-2">
                <Label htmlFor="student-name" className="form-label">Full Name</Label>
                <Input id="student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="form-input" placeholder="e.g. John Doe"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-id" className="form-label">Student ID</Label>
                <Input id="student-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="form-input" placeholder="e.g. 2021-12345"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="form-label">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="e.g. john.doe@example.com"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course" className="form-label">Course</Label>
                <Select onValueChange={setCourse} value={course}>
                  <SelectTrigger className="form-select"><SelectValue placeholder="Select your course..." /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.acronym} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year-level" className="form-label">Year Level</Label>
                <Select onValueChange={setYearLevel} value={yearLevel}>
                  <SelectTrigger className="form-select"><SelectValue placeholder="Select your year level..." /></SelectTrigger>
                  <SelectContent>{yearLevels.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Document Selection */}
            <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
              <Label className="text-lg font-bold text-blue-600">Select Documents</Label>
              {isLoadingDocuments ? <p>Loading documents...</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableDocuments.map(doc => (
                    <motion.div key={doc.id} layout className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col gap-2 transition-all hover:shadow-md hover:border-blue-300">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`doc-${doc.id}`} className="flex items-center gap-3 font-semibold text-md cursor-pointer text-gray-800">
                          <Checkbox id={`doc-${doc.id}`} onCheckedChange={(checked) => handleDocSelection(doc, !!checked)} className="form-checkbox"/>
                          {doc.name}
                        </Label>
                        <span className="font-bold text-gray-700">PHP {doc.price.toFixed(2)}</span>
                      </div>
                      <AnimatePresence>
                        {selectedDocs.has(doc.id) && (doc.name === 'Certification' || doc.name === 'Others') && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                            <Input 
                              placeholder={`Specify for ${doc.name}...`} 
                              className="form-input mt-1"
                              value={selectedDocs.get(doc.id)?.details || ''}
                              onChange={(e) => handleDocDetailsChange(doc.id, e.target.value)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Detailed Purpose */}
            <div className="space-y-2 mb-8">
              <Label htmlFor="purpose" className="form-label">Detailed Purpose for Request</Label>
              <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required rows={4} className="form-textarea" placeholder="Please provide a detailed reason for your request(s)..."/>
            </div>

            {/* Summary Section */}
            <AnimatePresence>
              {selectedDocs.size > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6">
                  <div className="summary-card">
                    <h3 className="summary-title">Request Summary</h3>
                    <div className="space-y-3">
                      {Array.from(selectedDocs.values()).map(doc => (
                        <div key={doc.id} className="summary-item">
                          <div>
                            <p className="font-semibold text-gray-800">{doc.name}</p>
                            {doc.details && <p className="text-sm text-gray-600 pl-2">&ndash; {doc.details}</p>}
                          </div>
                          <p className="font-semibold whitespace-nowrap text-blue-600">PHP {doc.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 space-y-4">
                       <div className="summary-total">
                          <span>Total Amount:</span>
                          <span>PHP {totalAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <Label className="text-lg font-medium text-gray-700">Estimated Processing Time</Label>
                          <div className="flex items-center gap-4 mt-2">
                             <div className="progress-bar-container w-full"><div className="progress-bar" style={{width: `${(totalProcessingDays / 30) * 100}%`}}></div></div>
                             <span className="font-bold text-lg text-blue-600">{totalProcessingDays} days</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">This is an estimate. Actual processing time may vary.</p>
                        </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="p-8 mt-4">
            <Button 
              size="lg" 
              className="form-button" 
              onClick={handleRequest} 
              disabled={!isFormValid || mutation.isLoading}
            >
              {mutation.isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
