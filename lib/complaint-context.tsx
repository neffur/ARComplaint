"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";

export type ComplaintType =
  | "Requesting gifts or donations"
  | "Advertising or self-promotion"
  | "Spam or repeated messages"
  | "NSFW / inappropriate content"
  | "Multi-tab abuse"
  | "Other";

export interface Complaint {
  createdAt: string | number | Date;
  id: string;
  platoId: string;
  type: ComplaintType;
  details: string;
  status: ComplaintStatus;
  date: Date;
  files?: string[];
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, "id" | "status" | "date">) => void;
  updateStatus: (id: string, status: ComplaintStatus) => void;
  deleteComplaint: (id: string) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

// Mock initial data
const initialComplaints: Complaint[] = [
  {
    createdAt: new Date("2024-03-15T10:45:00"),
    id: "PL-10012",
    platoId: "PLATO-4521",
    type: "Spam or repeated messages",
    details: "User is repeatedly sending spam messages in multiple channels. This has been going on for several days now and is disrupting the community.",
    status: "Pending",
    date: new Date("2024-03-15T10:45:00"),
  },
  {
    createdAt: new Date("2024-03-14T14:30:00"),
    id: "PL-10011",
    platoId: "PLATO-3892",
    type: "NSFW / inappropriate content",
    details: "Application is crashing frequently during usage. Needs urgent attention. The issue occurs when trying to access the settings panel.",
    status: "In Progress",
    date: new Date("2024-03-14T14:30:00"),
  },
  {
    createdAt: new Date("2024-03-13T09:15:00"),
    id: "PL-10010",
    platoId: "PLATO-2741",
    type: "Advertising or self-promotion",
    details: "User is constantly promoting their external services without permission. This violates our community guidelines.",
    status: "Resolved",
    date: new Date("2024-03-13T09:15:00"),
  },
  {
    createdAt: new Date("2024-03-12T16:20:00"),
    id: "PL-10009",
    platoId: "PLATO-5123",
    type: "Requesting gifts or donations",
    details: "This user has been soliciting donations from other members through direct messages.",
    status: "Pending",
    date: new Date("2024-03-12T16:20:00"),
  },
  {
    createdAt: new Date("2024-03-11T11:00:00"),
    id: "PL-10008",
    platoId: "PLATO-1987",
    type: "Multi-tab abuse",
    details: "Detected suspicious activity with multiple tabs open simultaneously to manipulate the system.",
    status: "In Progress",
    date: new Date("2024-03-11T11:00:00"),
  },
];

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);

  const addComplaint = (complaint: Omit<Complaint, "id" | "status" | "date">) => {
    const createdAt = complaint.createdAt ?? new Date();

    const newComplaint: Complaint = {
      ...complaint,
      createdAt,
      id: `PL-${10013 + complaints.length}`,
      status: "Pending",
      date: new Date(createdAt),
    };
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const updateStatus = (id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteComplaint = (id: string) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ComplaintContext.Provider
      value={{ complaints, addComplaint, updateStatus, deleteComplaint }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintProvider");
  }
  return context;
}
