import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId is required" },
      { status: 400 }
    );
  }

   const url = `${TWELVELABS_API_BASE_URL}/tasks/${taskId}`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${API_KEY}`,
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const task= await response.json();

    return NextResponse.json({
      status: task?.status,
      videoUrl: task?.hls?.video_url,
      thumbnailUrl: task?.hls?.thumbnail_urls[0],
      metadata: task?.metadata,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
