"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormValues } from "@/lib/schemas/profileSchema";
import { User, UpdateProfileRequest } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, CallIcon, Note01Icon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";

interface EditProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone_number: user?.phone_number || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      await onSave(values);
      toast.success("Profile Updated successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl font-bold">Edit profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} size={18} className="text-gray-500" />
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HugeiconsIcon icon={CallIcon} size={18} className="text-gray-500" />
                    Phone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HugeiconsIcon icon={Note01Icon} size={18} className="text-gray-500" />
                    Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself" 
                      {...field} 
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold transition-all"
              disabled={isSaving}
            >
              {isSaving ? "Saving Changes..." : "Save changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
