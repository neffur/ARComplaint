"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { UploadDropzone } from "./upload-dropzone";
import { useComplaints, ComplaintType } from "@/lib/complaint-context";

const complaintTypes: ComplaintType[] = [
  "Requesting gifts or donations",
  "Advertising or self-promotion",
  "Spam or repeated messages",
  "NSFW / inappropriate content",
  "Multi-tab abuse",
  "Other",
];

export function ComplaintForm() {
  const { addComplaint } = useComplaints();
  const [platoId, setPlatoId] = useState("");
  const [complaintType, setComplaintType] = useState<ComplaintType | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platoId || !complaintType || !details) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addComplaint({
      platoId,
      type: complaintType as ComplaintType,
      details,
      createdAt: ""
    });

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset form after showing success
    setTimeout(() => {
      setPlatoId("");
      setComplaintType("");
      setDetails("");
      setIsSuccess(false);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative rounded-lg bg-[#1a1a1a] overflow-hidden">
          {/* Red corner accent */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[80px] border-t-primary border-l-[80px] border-l-transparent" />
          
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Complaint Submitted
              </h2>
              <p className="text-muted-foreground text-center">
                Your complaint has been successfully submitted and is now being reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-lg bg-[#1a1a1a] overflow-hidden">
        {/* Red corner accent */}
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[80px] border-t-primary border-l-[80px] border-l-transparent" />
        
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold italic text-foreground tracking-tight">
              NEW COMPLAINT
            </h1>
            <p className="text-muted-foreground text-sm mt-2">All fields are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plato ID Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                YOUR PLATO ID
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground pointer-events-none">
                  <span className="text-sm font-medium">🆔</span>
                </div>
                <input
                  type="text"
                  value={platoId}
                  onChange={(e) => setPlatoId(e.target.value)}
                  placeholder="PLATO-ID"
                  className="w-full h-12 pl-12 pr-4 rounded-md bg-[#121212] border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Complaint Type Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                COMPLAINT TYPE
              </label>
              <div className="relative">
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
                  className="w-full h-12 px-4 pr-10 rounded-md bg-[#121212] border border-primary text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled hidden>
                    Select Complaint Type
                  </option>
                  {complaintTypes.map((type) => (
                    <option key={type} value={type} className="bg-[#121212]">
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
              </div>
            </div>

            {/* Complaint Details */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                COMPLAINT DETAILS
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter your complaint details here and mention ids of the person(s) involved..."
                rows={5}
                className="w-full px-4 py-3 rounded-md bg-[#121212] border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                required
              />
            </div>

            {/* Upload Section */}
            <UploadDropzone />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "SUBMIT COMPLAINT"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
