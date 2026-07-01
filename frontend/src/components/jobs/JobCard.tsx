"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Location01Icon, 
  CurrencyIcon, 
  ArrowRight01Icon,
  Tick01Icon,
  Briefcase01Icon
} from "@hugeicons/core-free-icons";
import { Job } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, isApplied = false }) => {
  return (
    <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 pr-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
                <HugeiconsIcon icon={Briefcase01Icon} size={16} />
                <span className="text-sm truncate max-w-[150px]">{job.company_name}</span>
            </div>
          </div>
          
          <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
            {job.company_logo ? (
              <Image 
                src={job.company_logo} 
                alt={job.company_name || "Company"} 
                fill 
                className="object-cover"
              />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <HugeiconsIcon icon={Briefcase01Icon} size={24} />
                </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600 bg-blue-50/50 self-start px-3 py-1.5 rounded-lg w-fit">
            <HugeiconsIcon icon={Location01Icon} size={18} className="text-blue-600" />
            <span className="text-sm font-semibold">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-green-50/50 self-start px-3 py-1.5 rounded-lg w-fit">
            <HugeiconsIcon icon={CurrencyIcon} size={18} className="text-green-600" />
            <span className="text-sm font-bold text-gray-900">₹ {job.salary.toLocaleString()} P.A</span>
          </div>
        </div>

        <div className={`${isApplied ? 'flex items-center gap-3' : 'block'} pt-4 border-t border-gray-50`}>
          <Link href={`/jobs/${job.job_id}`} className="flex-1">
            <Button 
                variant="outline" 
                className="w-full h-11 gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
            >
              View Details
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Button>
          </Link>

          <div className="flex-1">
            {isApplied ? (
              <Button 
                disabled 
                className="w-full h-11 gap-2 bg-green-50 text-green-600 border border-green-100 rounded-xl opacity-100 cursor-default"
              >
                <HugeiconsIcon icon={Tick01Icon} size={18} />
                Applied
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
