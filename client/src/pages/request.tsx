
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
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDocumentRequest } from '../api/documents';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";


export default function Request() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { data: documents, isLoading: isDocsLoading } = useDocuments();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
      defaultValues: {
          studentName: '',
          studentId: '',
          email: '',
          course: '',
          yearLevel: '',
          documents: [],
          purpose: '',
          totalAmount: 0
      }
  });

  useEffect(() => {
    if (user) {
      setValue('studentName', user.name || '');
      setValue('studentId', user.studentId || '');
      setValue('email', user.email || '');
      setValue('course', user.course || '');
      setValue('yearLevel', user.yearLevel || '');
    }
  }, [user, setValue]);

  const selectedDocs = watch('documents', []);

  const calculateTotal = () => {
    const total = selectedDocs.reduce((acc, docId) => {
        const doc = documents?.find(d => d.$id === docId);
        return acc + (doc?.price || 0);
    }, 0);
    setValue('totalAmount', total);
    return total;
  };

  useEffect(() => {
      calculateTotal();
  }, [selectedDocs, documents]);


  const createRequestMutation = useMutation({
      mutationFn: createDocumentRequest,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
          toast({
              title: "Request Submitted!",
              description: "Your document request has been sent successfully.",
          });
          navigate("/my-requests");
      },
      onError: (error) => {
          toast({
              title: "Submission Error",
              description: `There was a problem: ${error.message}`,
              variant: "destructive",
          });
      }
  });

  const onSubmit = (data) => {
      const selectedDocDetails = data.documents.map(docId => {
          const fullDoc = documents?.find(d => d.$id === docId);
          return { 
              id: fullDoc?.$id, 
              name: fullDoc?.name, 
              price: fullDoc?.price,
              processingTimeDays: fullDoc?.processingTimeDays 
            };
      });

      const totalProcessingTime = selectedDocDetails.reduce((acc, doc) => acc + (doc.processingTimeDays || 0), 0);

      const requestData = {
          ...data,
          userId: user?.$id,
          documents: selectedDocDetails,
          estimatedCompletionDays: totalProcessingTime,
      };
      createRequestMutation.mutate(requestData);
  };
  
  const isLoading = isUserLoading || isDocsLoading;
  const isSubmitting = createRequestMutation.isPending;

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="text-center p-8">
               <CardTitle className="text-3xl font-bold text-blue-600">Request a Document</CardTitle>
               <CardDescription className="text-gray-600 pt-2 text-base">Complete the form below to submit your document request.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {/* Student Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 pb-8 border-b border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="student-name" className="form-label">Full Name</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : <Input id="student-name" {...register('studentName', { required: 'Full name is required' })} className="form-input" />}
                  {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-id" className="form-label">Student ID</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : <Input id="student-id" {...register('studentId', { required: 'Student ID is required' })} className="form-input" />}
                   {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="form-label">Email</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : <Input id="email" type="email" {...register('email', { required: 'Email is required' })} className="form-input" />}
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="form-label">Course</Label>
                   <Controller
                        name="course"
                        control={control}
                        rules={{ required: 'Course is required' }}
                        render={({ field }) => (
                             <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                <SelectTrigger className="form-select"><SelectValue placeholder="Select your course..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BSIT">BSIT</SelectItem>
                                    <SelectItem value="BSHM">BSHM</SelectItem>
                                    <SelectItem value="BSED">BSED</SelectItem>
                                    <SelectItem value="BEED">BEED</SelectItem>
                                    <SelectItem value="BPED">BPED</SelectItem>
                                    <SelectItem value="BSEntrep">BSEntrep</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year-level" className="form-label">Year Level</Label>
                   <Controller
                        name="yearLevel"
                        control={control}
                        rules={{ required: 'Year level is required' }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                <SelectTrigger className="form-select"><SelectValue placeholder="Select your year level..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                  {errors.yearLevel && <p className="text-red-500 text-xs mt-1">{errors.yearLevel.message}</p>}
                </div>
              </div>

              {/* Document Selection */}
                <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                    <Label className="text-lg font-bold text-blue-600">Select Documents</Label>
                    <Controller
                        name="documents"
                        control={control}
                        rules={{ required: 'Please select at least one document' }}
                        render={({ field }) => (
                            <>
                                {isLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                    </div>
                                ) : documents && documents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {documents.map(doc => (
                                            <div key={doc.$id} className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`doc-${doc.$id}`} className="flex items-center gap-3 font-semibold text-md cursor-pointer text-gray-800">
                                                        <Checkbox
                                                            id={`doc-${doc.$id}`}
                                                            className="form-checkbox"
                                                            onCheckedChange={(checked) => {
                                                                const currentSelection = field.value || [];
                                                                const newSelection = checked
                                                                    ? [...currentSelection, doc.$id]
                                                                    : currentSelection.filter(id => id !== doc.$id);
                                                                field.onChange(newSelection);
                                                            }}
                                                            checked={field.value?.includes(doc.$id)}
                                                        />
                                                        {doc.name}
                                                    </Label>
                                                    <span className="font-bold text-gray-700">PHP {doc.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 font-semibold">No documents are available for selection.</p>
                                        <p className="text-sm text-gray-500 mt-1">Please ask an administrator to add documents to the system.</p>
                                    </div>
                                )}
                            </>
                        )}
                    />
                    {errors.documents && <p className="text-red-500 text-xs mt-1">{errors.documents.message}</p>}
                </div>

              
              {/* Detailed Purpose */}
              <div className="space-y-2 mb-8">
                <Label htmlFor="purpose" className="form-label">Detailed Purpose for Request</Label>
                <Textarea 
                  id="purpose" 
                  rows={4} 
                  className="form-textarea" 
                  placeholder="Please provide a detailed reason for your request(s)..."
                  {...register('purpose', { required: 'Purpose is required' })}
                  disabled={isLoading}
                />
                 {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
              </div>

            <div className="text-right mb-8">
                <h3 className="text-2xl font-bold text-gray-800">Total: PHP {watch('totalAmount').toFixed(2)}</h3>
            </div>

            </CardContent>
            <CardFooter className="p-8 mt-4">
              <Button 
                type="submit"
                size="lg" 
                className="form-button w-full" 
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
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
