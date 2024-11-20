import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  return NextResponse.json({ apiKey: API_KEY });
}