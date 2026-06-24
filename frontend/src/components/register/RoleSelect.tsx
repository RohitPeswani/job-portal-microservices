"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase02Icon } from "@hugeicons/core-free-icons";
import { Control } from "react-hook-form";
import { RegisterFormValues } from "@/lib/schemas/registerSchema";

interface RoleSelectProps {
  control: Control<RegisterFormValues>;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="role"
      render={({ field }: { field: any }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-sm font-semibold text-gray-700">I want to</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <FormControl>
              <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white focus:ring-blue-600 pl-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Briefcase02Icon} size={18} className="text-gray-400" />
                  <SelectValue placeholder="Select your role" />
                </div>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
              <SelectItem value="jobseeker" className="py-3 focus:bg-blue-50 focus:text-blue-700">
                Find a Job
              </SelectItem>
              <SelectItem value="recruiter" className="py-3 focus:bg-blue-50 focus:text-blue-700">
                Hire Talent
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default RoleSelect;
