"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "react-toastify";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Mail01Icon, 
  Tick01Icon, 
  ArrowLeft01Icon 
} from "@hugeicons/core-free-icons";
import { Loader } from "@/components/loader";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:5000";

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Reset link sent successfully!");
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Failed to send reset link. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8">
          {!isSubmitted ? (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HugeiconsIcon icon={Mail01Icon} size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
                <p className="text-gray-500">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold mb-1 block">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Enter your email" 
                              {...field} 
                              className="h-12 pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 rounded-xl" 
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <HugeiconsIcon icon={Mail01Icon} size={18} />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold text-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? <Loader size={20} className="text-white" /> : "Submit"}
                  </Button>

                  <Link 
                    href="/login" 
                    className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mt-6"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                    Go to login page
                  </Link>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HugeiconsIcon icon={Tick01Icon} size={40} />
                </div>
                <div className="bg-green-50 border border-green-100 p-6 rounded-2xl mb-8">
                  <p className="text-green-800 font-medium leading-relaxed">
                    If that email exists, we have sent a reset link to your inbox.
                  </p>
                </div>
                <p className="text-gray-500 mb-8">
                  Didn't receive an email? Check your spam folder or try again in a few minutes.
                </p>
                <Link 
                    href="/login" 
                    className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                    Back to Login
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;