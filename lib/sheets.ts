const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwao-KACTU1AluSLvrGmWQXmQuwaV2aFBvLJpo05qrmFmRbMKBOeldEJhtYOo1r6Z9fZw/exec";

export interface Complaint {
  ID: string;
  PlatoID: string;
  Type: string;
  Details: string;
  ImageURL: string;
  Status: string;
  Date: string;
}

export async function fetchComplaints(): Promise<Complaint[]> {
  try {
    const res = await fetch(SCRIPT_URL, { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      // Filter out empty/ghost rows
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

export async function submitComplaint(payload: {
  platoId: string;
  type: string;
  details: string;
  imageUrl: string;
}): Promise<{ success: boolean; id?: string }> {
  try {
    if (!payload.platoId?.trim() || !payload.type?.trim() || !payload.details?.trim()) {
      return { success: false };
    }
    const res = await fetch(SCRIPT_URL, {
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
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "UPDATE", id, status }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}
