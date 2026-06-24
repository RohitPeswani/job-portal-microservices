"use client";

import React from "react";
import { Application } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase02Icon, Calendar03Icon, Location01Icon, Tag01Icon } from "@hugeicons/core-free-icons";

interface ApplicationsSectionProps {
  applications: Application[];
}

const ApplicationsSection: React.FC<ApplicationsSectionProps> = ({ applications }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "rejected":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "pending":
      case "applied":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-blue-600 p-6 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <HugeiconsIcon icon={Briefcase02Icon} size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Your Applied Jobs</h2>
          <p className="text-blue-100 text-sm">{applications.length} applications submitted</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((app) => (
              <Card key={app.application_id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">
                        {app.job_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon icon={Briefcase02Icon} size={14} />
                          <span className="font-medium text-gray-900">{app.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon icon={Location01Icon} size={14} />
                          <span>{app.job_location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon icon={Calendar03Icon} size={14} />
                          <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-4 md:pt-0">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <span className="text-blue-600">₹</span>
                            {Number(app.job_salary).toLocaleString()}
                        </div>
                      <Badge className={`px-4 py-1 rounded-full text-xs font-bold border-none ${getStatusColor(app.status)}`}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-gray-400 gap-4">
              <HugeiconsIcon icon={Briefcase02Icon} size={48} className="opacity-20" />
              <p className="text-sm font-medium">No Applications Yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationsSection;
