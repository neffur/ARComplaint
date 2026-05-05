import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user, pass } = await req.json();
  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
