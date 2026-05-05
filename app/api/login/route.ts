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
    const hoursLeft = Math.ceil((oneDayMs - (now - lastSubmit)) / (60 * 60 * 1000));
    return NextResponse.json(
      { success: false, error: "rate_limited", hoursLeft },
      { status: 429 }
    );
  }

  ipMap.set(ip, now);

  const body = await req.json();
  const payloadWithIP = { ...body, ip };

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGRJ7xdg5k6LZwZY8Whhvf1luqkTJ1Z_vhhKyoU9Ux_FL_6cT5v1L3fvIvnXXEUQPB0w/exec";

  try {
    const res = await fetch(`${SCRIPT_URL}?t=${Date.now()}`, {
      method: "POST",
      body: JSON.stringify(payloadWithIP),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
