import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  const API_KEY = process.env.TWELVELABS_API_KEY;
  const INDEX_ID = process.env.TWELVELABS_INDEX_ID;
  const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

  if (!API_KEY || !INDEX_ID) {
    return NextResponse.json(
      { error: "API key or Index ID is not set" },
      { status: 500 }
    );
  }

  const url = `${TWELVELABS_API_BASE_URL}/indexes/${INDEX_ID}/videos/${videoId}`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": `${API_KEY}`,
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const video = await response.json();

    return NextResponse.json({
      hls: video.hls,
      metadata: video.metadata,
      source: video.source,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
