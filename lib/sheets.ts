const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGRJ7xdg5k6LZwZY8Whhvf1luqkTJ1Z_vhhKyoU9Ux_FL_6cT5v1L3fvIvnXXEUQPB0w/exec";

export interface Complaint {
  ID: string;
  PlatoID: string;
  Type: string;
  Details: string;
  ImageURL: string;
  Status: string;
  Date: string;
  IP: string;
}

export async function fetchComplaints(): Promise<Complaint[]> {
  try {
    const res = await fetch(SCRIPT_URL, { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      return data.complaints.filter(
        (c: Complaint) =>
          c.ID && c.ID.trim() !== "" &&
          (c.PlatoID?.trim() || c.Type?.trim() || c.Details?.trim())
      );
    }
    return [];
  } catch {
    return [];
  }
}

function postUrl() {
  return `${SCRIPT_URL}?t=${Date.now()}`;
}

export async function submitComplaint(payload: {
  platoId: string;
  type: string;
  details: string;
  imageUrl: string;
}): Promise<{ success: boolean; error?: string; hoursLeft?: number }> {
  try {
    if (!payload.platoId?.trim() || !payload.type?.trim() || !payload.details?.trim()) {
      return { success: false };
    }
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function deleteComplaint(id: string): Promise<boolean> {
  try {
    if (!id?.trim()) return false;
    const res = await fetch(postUrl(), {
      method: "POST",
      body: JSON.stringify({ _method: "DELETE", id }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function updateStatus(id: string, status: string): Promise<boolean> {
  try {
    if (!id?.trim() || !status?.trim()) return false;
    const res = await fetch(postUrl(), {
      method: "POST",
      body: JSON.stringify({ _method: "UPDATE", id, status }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}
