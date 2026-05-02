"use client";

import { useMemo } from "react";
import { FileX } from "lucide-react";
import { ComplaintCard } from "./complaint-card";
import { Complaint, ComplaintStatus, ComplaintType } from "@/lib/complaint-context";

interface ComplaintListProps {
  complaints: Complaint[];
  statusFilter: ComplaintStatus | "All";
  typeFilter: ComplaintType | "All";
  sortBy: "Date" | "Priority" | "Status";
  searchQuery: string;
}

const priorityOrder: Record<ComplaintType, number> = {
  "NSFW / inappropriate content": 1,
  "Multi-tab abuse": 2,
  "Spam or repeated messages": 3,
  "Requesting gifts or donations": 4,
  "Advertising or self-promotion": 5,
  Other: 6,
};

const statusOrder: Record<ComplaintStatus, number> = {
  Pending: 1,
  "In Progress": 2,
  Resolved: 3,
};

export function ComplaintList({
  complaints,
  statusFilter,
  typeFilter,
  sortBy,
  searchQuery,
}: ComplaintListProps) {
  const filteredAndSortedComplaints = useMemo(() => {
    let filtered = [...complaints];

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "All") {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.platoId.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.details.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Date":
          return b.date.getTime() - a.date.getTime();
        case "Priority":
          return priorityOrder[a.type] - priorityOrder[b.type];
        case "Status":
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [complaints, statusFilter, typeFilter, sortBy, searchQuery]);

  if (filteredAndSortedComplaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <FileX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No complaints found
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          {searchQuery
            ? "No complaints match your search criteria. Try adjusting your filters."
            : "There are no complaints to display at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredAndSortedComplaints.length}
          </span>{" "}
          complaint{filteredAndSortedComplaints.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {filteredAndSortedComplaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}
