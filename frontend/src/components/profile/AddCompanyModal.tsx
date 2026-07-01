"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Building02Icon, 
  Note01Icon, 
  GlobalIcon, 
  Camera01Icon 
} from "@hugeicons/core-free-icons";
import { Loader } from "../loader";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Please enter a valid URL"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: CompanyFormValues, logo: File) => Promise<void>;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
    },
  });

  const handleSubmit = async (values: CompanyFormValues) => {
    if (!logo) {
      alert("Company logo is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(values, logo);
      form.reset();
      setLogo(null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Building02Icon} size={24} className="text-blue-600" />
            Add New Company
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HugeiconsIcon icon={Building02Icon} size={18} />
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HugeiconsIcon icon={Note01Icon} size={18} />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What does your company do?" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HugeiconsIcon icon={GlobalIcon} size={18} />
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <HugeiconsIcon icon={Camera01Icon} size={18} />
                Company Logo
              </FormLabel>
              <div className="flex items-center gap-4">
                 <Input 
                   type="file" 
                   accept="image/*"
                   onChange={(e) => setLogo(e.target.files?.[0] || null)}
                   className="cursor-pointer"
                 />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gray-900 text-white min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader size={18} text="Adding..." className="text-white" />
                ) : (
                  "Add Company"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyModal;
