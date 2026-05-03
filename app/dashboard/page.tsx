"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { fetchComplaints, deleteComplaint, updateStatus, Complaint } from "@/lib/sheets";
import { BarChart3, Clock, CheckCircle2, AlertCircle, Eye, Trash2, RefreshCw, X } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("arc_auth");
    if (auth === "1") { setAuthed(true); loadComplaints(); }
    else setLoading(false);
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    const data = await fetchComplaints();
    setComplaints(data.reverse());
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const user = (form.elements.namedItem("user") as HTMLInputElement).value;
    const pass = (form.elements.namedItem("pass") as HTMLInputElement).value;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem("arc_auth", "1");
      setAuthed(true);
      loadComplaints();
    } else {
      alert("Invalid credentials");
    }
  };

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;
    if (!confirm("Delete this complaint?")) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    const ok = await deleteComplaint(id);
    setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    if (ok) {
      setComplaints((prev) => prev.filter((c) => c.ID !== id));
    } else {
      alert("Failed to delete. Please try again.");
    }
  };

  const handleStatus = async (id: string, status: string) => {
    const ok = await updateStatus(id, status);
    if (ok) {
      setComplaints((prev) => prev.map((c) => c.ID === id ? { ...c, Status: status } : c));
    } else {
      alert("Failed to update status. Please try again.");
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "PlatoID", "Type", "Details", "Status", "Date"];
    const rows = complaints.map((c) => [c.ID, c.PlatoID, c.Type, `"${(c.Details || "").replace(/"/g, '""')}"`, c.Status, c.Date]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "complaints.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = complaints.filter((c) => c.ID).filter((c) => {
    if (statusFilter !== "All" && c.Status !== statusFilter) return false;
    if (typeFilter !== "All" && c.Type !== typeFilter) return false;
    if (search && !c.PlatoID?.toLowerCase().includes(search.toLowerCase()) && !c.Details?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColor: Record<string, string> = {
    Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "In Progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] px-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <img src="/icono.png" alt="logo" className="h-16 w-auto mx-auto mb-4 logo-pulse" />
            <h1 className="text-xl font-bold text-white tracking-widest uppercase">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" type="text" placeholder="Username" autoComplete="off"
              className="w-full h-12 px-4 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input name="pass" type="password" placeholder="Password"
              className="w-full h-12 px-4 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <button type="submit" className="btn-shine w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm uppercase tracking-widest transition-all"
              style={{ boxShadow: "0 4px 20px rgba(239,68,68,0.3)" }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pending = complaints.filter((c) => c.Status === "Pending").length;
  const inProgress = complaints.filter((c) => c.Status === "In Progress").length;
  const resolved = complaints.filter((c) => c.Status === "Resolved").length;
  const types = [...new Set(complaints.map((c) => c.Type).filter(Boolean))];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">COMPLAINT DASHBOARD</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage and review all submitted complaints.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={loadComplaints} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-primary/50 transition-all text-sm">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-all text-sm font-medium">
                ⬇ Export Excel
              </button>
              <button onClick={() => { sessionStorage.removeItem("arc_auth"); setAuthed(false); router.push("/"); }}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm">
                Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: complaints.length, icon: BarChart3, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
              { label: "Pending", value: pending, icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
              { label: "In Progress", value: inProgress, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
              { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl bg-card border border-border p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl bg-card border border-border">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search by Plato ID or keywords..."
              className="flex-1 min-w-[200px] h-10 px-4 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-lg bg-input border border-border text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-lg bg-input border border-border text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="All">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {(statusFilter !== "All" || typeFilter !== "All" || search) && (
              <button onClick={() => { setStatusFilter("All"); setTypeFilter("All"); setSearch(""); }}
                className="h-10 px-4 rounded-lg border border-primary/50 text-primary text-sm hover:bg-primary/10 transition-all flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Complaints */}
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No complaints found.</div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Showing <span className="text-white font-medium">{filtered.length}</span> complaints</p>
              {filtered.map((c) => (
                <div key={c.ID} className="rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition-all">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor[c.Status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                          {c.Status}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{c.PlatoID}</span>
                        <span className="text-xs text-muted-foreground">{c.Date}</span>
                      </div>
                      <p className="font-semibold text-white text-sm mb-1">{c.Type}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{c.Details}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full border-t border-border pt-3 mt-1">
                      {c.ImageURL && (
                        <button onClick={() => setSelectedImage(c.ImageURL)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs hover:bg-primary/10 transition-all">
                          <Eye className="w-3 h-3" /> View Proof
                        </button>
                      )}
                      <button onClick={() => setSelectedComplaint(c)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 text-xs hover:bg-blue-500/10 transition-all">
                        Update Status
                      </button>
                      <button onClick={() => handleDelete(c.ID)} disabled={deletingIds.has(c.ID)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Trash2 className="w-3 h-3" /> {deletingIds.has(c.ID) ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Image modal */}
      {selectedImage && (() => {
        const imageList = selectedImage.split("|||").filter(Boolean);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="sticky top-0 float-right p-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all z-10 ml-auto block">
                <X className="w-4 h-4" />
              </button>
              {imageList.length > 1 && (
                <p className="text-center text-sm text-muted-foreground">{imageList.length} proof images</p>
              )}
              {imageList.map((url, i) => (
                <img key={i} src={url} alt={`Proof ${i + 1}`} className="w-full rounded-xl border border-border" />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Status update modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedComplaint(null)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4">Update Status</h3>
            <p className="text-muted-foreground text-sm mb-4">{selectedComplaint.PlatoID} — {selectedComplaint.Type}</p>
            <div className="space-y-2">
              {["Pending", "In Progress", "Resolved"].map((s) => (
                <button key={s} onClick={() => { handleStatus(selectedComplaint.ID, s); setSelectedComplaint(null); }}
                  className={`w-full py-2 rounded-lg border text-sm font-medium transition-all ${selectedComplaint.Status === s ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-white"}`}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedComplaint(null)} className="mt-4 w-full py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© <span className="font-bold text-white"><span className="text-red-500">AR</span>Complaint</span></p>
        </div>
      </footer>
    </div>
  );
}
