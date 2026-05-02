"use client";

import { useState } from "react";
import { Eye, RefreshCw, Trash2, X, ChevronDown } from "lucide-react";
import { Complaint, ComplaintStatus, useComplaints } from "@/lib/complaint-context";

interface ComplaintCardProps {
  complaint: Complaint;
}

const statusColors: Record<ComplaintStatus, string> = {
  Pending: "bg-[#f2c94c]/20 text-[#f2c94c] border-[#f2c94c]/30",
  "In Progress": "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30",
  Resolved: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
};

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const { updateStatus, deleteComplaint } = useComplaints();
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleStatusChange = (status: ComplaintStatus) => {
    updateStatus(complaint.id, status);
    setShowStatusMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      deleteComplaint(complaint.id);
    }
  };

  return (
    <>
      <div className="rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition-all duration-200 group">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  statusColors[complaint.status]
                }`}
              >
                {complaint.status}
              </span>

              {/* Complaint ID */}
              <span className="text-sm font-mono text-muted-foreground">
                {complaint.id}
              </span>
            </div>

            {/* Complaint Type */}
            <h3 className="text-base font-semibold text-foreground mb-2">
              {complaint.type}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {complaint.details}
            </p>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
            {/* Date */}
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDate(complaint.date)}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="h-9 px-3 rounded-lg border border-primary/50 text-primary text-xs font-medium hover:bg-primary/10 transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="h-9 px-3 rounded-lg border border-primary/50 text-primary text-xs font-medium hover:bg-primary/10 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Update Status
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-popover border border-border shadow-xl z-10">
                    {(["Pending", "In Progress", "Resolved"] as ComplaintStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            complaint.status === status
                              ? "text-primary font-medium"
                              : "text-foreground"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleDelete}
                className="h-9 px-3 rounded-lg border border-primary/50 text-primary text-xs font-medium hover:bg-destructive/20 hover:border-destructive/50 hover:text-destructive transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Complaint Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    statusColors[complaint.status]
                  }`}
                >
                  {complaint.status}
                </span>
                <span className="text-sm font-mono text-muted-foreground">
                  {complaint.id}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Plato ID
                </label>
                <p className="text-foreground mt-1">{complaint.platoId}</p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Complaint Type
                </label>
                <p className="text-foreground mt-1">{complaint.type}</p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Details
                </label>
                <p className="text-foreground mt-1 whitespace-pre-wrap">
                  {complaint.details}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Submitted
                </label>
                <p className="text-foreground mt-1">
                  {formatDate(complaint.date)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-6 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
