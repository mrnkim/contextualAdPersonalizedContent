import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const indexId = searchParams.get("indexId");
  const videoId = searchParams.get("videoId");
  const time = searchParams.get("time");

  if (!indexId || !videoId) {
    return NextResponse.json(
      { error: "taskId and videoId are required" },
      { status: 400 }
    );
  }

   const url = `${TWELVELABS_API_BASE_URL}/indexes/${indexId}/videos/${videoId}/thumbnail${time ? `?time=${time}` : ''}`;

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

    const responseData = await response.json();

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
