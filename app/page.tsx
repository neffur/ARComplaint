"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { submitComplaint } from "@/lib/sheets";
import { Upload, CheckCircle, X, AlertCircle } from "lucide-react";

const complaintTypes = [
  "Requesting gifts or donations",
  "Advertising or self-promotion",
  "Spam or repeated messages",
  "NSFW / inappropriate content",
  "Multi-tab abuse",
  "Other",
];

export default function HomePage() {
  const router = useRouter();
  const [platoId, setPlatoId] = useState("");
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  const triggerUploadAnimation = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2000);
    }, 1200);
  };

  const addImages = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) { setError("Only image files are allowed."); return; }
    setError("");
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, { file, preview: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    triggerUploadAnimation();
  }, []);

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (type === "Other") {
      const newClicks = secretClicks + 1;
      setSecretClicks(newClicks);
      if (newClicks >= 5) {
        router.push("/login");
        return;
      }
    } else {
      setSecretClicks(0);
    }

    if (!platoId || !type || !details) { setError("Please fill in all required fields."); return; }
    setIsSubmitting(true);

    let imageUrl = "";
    if (images.length > 0) {
      try {
        const uploadedUrls = await Promise.all(
          images.map(async (img) => {
            const base64 = img.preview.split(",")[1];
            const formData = new FormData();
            formData.append("key", process.env.NEXT_PUBLIC_IMGBB_API_KEY || "");
            formData.append("image", base64);
            const res = await fetch("https://api.imgbb.com/1/upload", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.success) return data.data.url as string;
            throw new Error("ImgBB upload failed");
          })
        );
        imageUrl = uploadedUrls.join("|||");
      } catch {
        setError("Failed to upload images. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const result = await submitComplaint({ platoId, type, details, imageUrl });
    if (result.success) {
      setSubmitted(true);
      setPlatoId(""); setType(""); setDetails(""); setImages([]);
      setSecretClicks(0);
    } else {
      setError("Failed to submit. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col relative">
        <iframe
          src="https://my.spline.design/particlesflow-PtQU8Ub37d35R9Z7insAuquP/"
          className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
          style={{ border: "none" }}
        />
        <Navbar />
        <main className="flex-1 flex items-start justify-center px-4 pt-24 pb-16">
          <div className="text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Complaint Submitted!</h2>
            <p className="text-muted-foreground">Your report has been received and will be reviewed.</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
              Submit Another
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Spline background */}
      <iframe
        src="https://my.spline.design/particlesflow-PtQU8Ub37d35R9Z7insAuquP/"
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
        style={{ border: "none" }}
      />
      <Navbar />
      <main className="flex-1 flex items-start justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl bg-card border border-border p-8 shadow-xl shadow-black/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-widest uppercase text-white">New Complaint</h1>
              <p className="text-muted-foreground text-sm mt-1">All fields marked * are required.</p>
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plato ID */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Your Plato ID *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">ID</span>
                  <input type="text" value={platoId} onChange={(e) => setPlatoId(e.target.value)} placeholder="PLATO-ID"
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono" />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Complaint Type *</label>
                <div className="relative">
                  <select value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer">
                    <option value="" disabled hidden>Select Complaint Type</option>
                    {complaintTypes.map((t) => <option key={t} value={t} className="bg-input">{t}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">▾</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Complaint Details *</label>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)}
                  placeholder="Enter your complaint details here and mention IDs of the person(s) involved..."
                  rows={4} className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Proof Images (optional){images.length > 0 && <span className="text-red-400 ml-2">{images.length} file{images.length > 1 ? "s" : ""} added</span>}
                </label>
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); addImages(Array.from(e.dataTransfer.files)); }}
                  className={`relative flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer overflow-hidden transition-all dropzone-3d ${
                    isDragging ? "border-red-500 bg-red-500/10 dragging" : "border-red-500/40 bg-[#1a1a1a]"
                  }`}
                >
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "linear-gradient(rgba(239,68,68,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.3) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }} />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 rounded-br-xl" />
                  <div className="relative flex flex-col items-center gap-2 z-10">
                    <div className="relative flex items-center justify-center w-10 h-10">
                      {!isUploading && !justUploaded && <div className="absolute inset-0 rounded-full border border-red-500/30 pulse-ring" />}
                      {isUploading && <Upload className="w-6 h-6 text-red-500 float-icon absolute" />}
                      {justUploaded && <CheckCircle className="w-6 h-6 text-green-500 success-icon" />}
                      {!isUploading && !justUploaded && <Upload className={`w-6 h-6 transition-colors duration-200 ${isDragging ? "text-red-400" : "text-red-500/70"}`} />}
                    </div>
                    {justUploaded ? (
                      <p className="text-xs font-semibold text-green-400 tracking-widest uppercase">Added!</p>
                    ) : isUploading ? (
                      <p className="text-xs text-red-400 uppercase tracking-widest">Adding...</p>
                    ) : (
                      <>
                        <p className="text-sm font-light tracking-widest uppercase shimmer-text">Upload</p>
                        <p className="text-xs text-red-500/50">{isDragging ? "Drop it!" : "Click or drag & drop — add as many as you want"}</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" multiple
                    onChange={(e) => { if (e.target.files) addImages(Array.from(e.target.files)); }} />
                </label>
                {images.length > 0 && (
                  <div className="space-y-2 mt-1">
                    {images.map((img, index) => (
                      <div key={index} className="file-slide flex items-center gap-3 p-2 bg-[#121212] rounded-lg border border-red-500/20 file-item-3d">
                        <img src={img.preview} alt="" className="w-12 h-12 rounded-md object-cover flex-shrink-0 border border-red-500/20" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{img.file.name}</p>
                          <p className="text-xs text-muted-foreground">{(img.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => removeImage(index)}
                          className="p-1.5 rounded-md hover:bg-red-500/20 transition-all group flex-shrink-0">
                          <X className="w-3.5 h-3.5 text-red-500/50 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="btn-shine w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : "Submit Complaint"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© <span className="font-bold text-white"><span className="text-red-500">AR</span>Complaint</span></p>
        </div>
      </footer>
    </div>
  );
}
