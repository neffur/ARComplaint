"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { ComplaintStatus, ComplaintType } from "@/lib/complaint-context";

interface FilterBarProps {
  statusFilter: ComplaintStatus | "All";
  setStatusFilter: (status: ComplaintStatus | "All") => void;
  typeFilter: ComplaintType | "All";
  setTypeFilter: (type: ComplaintType | "All") => void;
  sortBy: "Date" | "Priority" | "Status";
  setSortBy: (sort: "Date" | "Priority" | "Status") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClearFilters: () => void;
}

const statusOptions: (ComplaintStatus | "All")[] = [
  "Pending",
  "In Progress",
  "Resolved",
];

const typeOptions: (ComplaintType | "All")[] = [
  "Requesting gifts or donations",
  "Advertising or self-promotion",
  "Spam or repeated messages",
  "NSFW / inappropriate content",
  "Multi-tab abuse",
  "Other",
];

const sortOptions: ("Date" | "Priority" | "Status")[] = [
  "Priority",
  "Status",
];

export function FilterBar({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    statusFilter !== "All" ||
    typeFilter !== "All" ||
    sortBy !== "Date" ||
    searchQuery !== "";

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-card border border-border">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Status Dropdown */}
        <div className="relative flex-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Status
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ComplaintStatus | "All")
              }
              className="w-full h-10 px-3 pr-10 rounded-lg bg-input border border-border text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
            >
              <option value="All" disabled hidden>All</option>  
      {statusOptions.map((status) => (
        <option key={status} value={status} className="bg-input">
          {status}
    </option>
            ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Type Dropdown */}
        <div className="relative flex-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Complaint Type
          </label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ComplaintType | "All")
              }
              className="w-full h-10 px-3 pr-10 rounded-lg bg-input border border-border text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
            >
             <option value="All" disabled hidden>All</option>
{typeOptions.map((type) => (
  <option key={type} value={type} className="bg-input">
    {type}
  </option>
))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Sort By
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "Date" | "Priority" | "Status")
              }
              className="w-full h-10 px-3 pr-10 rounded-lg bg-input border border-border text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
            >
            <option value="Date" disabled hidden>Date</option>
{sortOptions.map((sort) => (
  <option key={sort} value={sort} className="bg-input">
    {sort}
  </option>
))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Plato ID or keywords"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="h-10 px-4 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}
