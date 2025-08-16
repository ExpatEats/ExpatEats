import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const nutritionFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  goals: z.string().min(10, { message: "Please describe your dietary goals" }),
});

type NutritionFormValues = z.infer<typeof nutritionFormSchema>;

const NutritionForm: React.FC = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  
  const form = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      name: '',
      email: '',
      goals: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: NutritionFormValues) => {
      return apiRequest('POST', '/api/nutrition', values);
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: NutritionFormValues) => {
    mutation.mutate(values);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Thank you for your interest in our nutrition consultation services. One of our nutritionists will contact you shortly.
        </p>
        <Button 
          onClick={() => setSubmitted(false)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Goals</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your nutrition goals and any dietary restrictions" 
                  className="resize-none" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white rounded-full mt-2"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Submitting...' : 'Book Consultation'}
        </Button>
      </form>
    </Form>
  );
};

export default NutritionForm;
