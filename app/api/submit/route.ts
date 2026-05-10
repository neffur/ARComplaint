import { NextRequest, NextResponse } from "next/server";

const ipMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const lastSubmit = ipMap.get(ip);

  if (lastSubmit && now - lastSubmit < oneDayMs) {
    const hoursLeft = Math.ceil(
      (oneDayMs - (now - lastSubmit)) / (60 * 60 * 1000)
    );

    return NextResponse.json(
      { success: false, error: "rate_limited", hoursLeft },
      { status: 429 }
    );
  }

  ipMap.set(ip, now);

  const body = await req.json();
  const payloadWithIP = { ...body, ip };

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxGRJ7xdg5k6LZwZY8Whhvf1luqkTJ1Z_vhhKyoU9Ux_FL_6cT5v1L3fvIvnXXEUQPB0w/exec";

  try {
    const res = await fetch(`${SCRIPT_URL}?t=${Date.now()}`, {
      method: "POST",
      body: JSON.stringify(payloadWithIP),
    });

    const data = await res.json();

    // Send Discord notification if submission succeeded
  if (data.success && process.env.DISCORD_WEBHOOK_URL) {
      const imageUrls = (body.imageUrl || "").split("|||").filter(Boolean);

      const imageContent = imageUrls.length > 0
        ? "\n\n" + imageUrls.join("\n")
        : "";

      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **New Complaint**\n\n👤 **Plato ID:** ${body.platoId || "N/A"}\n📋 **Type:** ${body.type || "N/A"}\n📝 **Details:** ${body.details?.slice(0, 500) || "N/A"}${imageContent}`,
        }),
      });
    }

  
