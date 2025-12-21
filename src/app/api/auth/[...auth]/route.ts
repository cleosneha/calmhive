import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Auth endpoint placeholder
    const body = await req.json();

    return NextResponse.json({ message: "Auth endpoint" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Auth endpoint" }, { status: 200 });
}
