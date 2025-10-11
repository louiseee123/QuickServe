
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FilePlus, User, CheckSquare, Loader2 } from 'lucide-react';
import useAuth from "../hooks/use-auth";
import { useDocuments } from "../hooks/use-documents";
import "./request.css";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Request() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { data: documents, isLoading: isDocsLoading } = useDocuments();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    if (user) {
      setStudentName(user.name || '');
      setStudentId(user.studentId || '');
      setEmail(user.email || '');
      setCourse(user.course || '');
      setYearLevel(user.yearLevel || '');
    }
  }, [user]);

  const handleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const isSubmitDisabled = selectedDocs.length === 0 || !purpose;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic
    console.log({
      studentName,
      studentId,
      email,
      course,
      yearLevel,
      selectedDocs,
      purpose,
    });
  };

  const isLoading = isUserLoading || isDocsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 modern-form">
      <main className="container mx-auto pt-24 px-4 pb-16 flex flex-col items-center">
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
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center p-8">
               <CardTitle className="text-3xl font-bold text-blue-600">Request a Document</CardTitle>
               <CardDescription className="text-gray-600 pt-2 text-base">Complete the form below to submit your document request.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {/* Student Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 pb-8 border-b border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="student-name" className="form-label">Full Name</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : <Input id="student-name" required className="form-input" value={studentName} onChange={(e) => setStudentName(e.target.value)} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-id" className="form-label">Student ID</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : <Input id="student-id" required className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="form-label">Email</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : <Input id="email" type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="form-label">Course</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Select value={course} onValueChange={setCourse}>
                      <SelectTrigger className="form-select"><SelectValue placeholder="Select your course..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Business Administration">Business Administration</SelectItem>
                        <SelectItem value="Psychology">Psychology</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year-level" className="form-label">Year Level</Label>
                   {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Select value={yearLevel} onValueChange={setYearLevel}>
                      <SelectTrigger className="form-select"><SelectValue placeholder="Select your year level..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Document Selection */}
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <Label className="text-lg font-bold text-blue-600">Select Documents</Label>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents?.map(doc => (
                      <div key={doc.$id} className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`doc-${doc.$id}`} className="flex items-center gap-3 font-semibold text-md cursor-pointer text-gray-800">
                            <Checkbox 
                              id={`doc-${doc.$id}`} 
                              className="form-checkbox"
                              onCheckedChange={() => handleDocSelection(doc.$id)}
                              checked={selectedDocs.includes(doc.$id)}
                            />
                            {doc.name}
                          </Label>
                          <span className="font-bold text-gray-700">PHP {doc.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Detailed Purpose */}
              <div className="space-y-2 mb-8">
                <Label htmlFor="purpose" className="form-label">Detailed Purpose for Request</Label>
                <Textarea 
                  id="purpose" 
                  required 
                  rows={4} 
                  className="form-textarea" 
                  placeholder="Please provide a detailed reason for your request(s)..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={isLoading}
                />
              </div>

            </CardContent>
            <CardFooter className="p-8 mt-4">
              <Button 
                type="submit"
                size="lg" 
                className="form-button" 
                disabled={isLoading || isSubmitDisabled}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
