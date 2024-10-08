import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const API_KEY = process.env.TWELVELABS_API_KEY;
  const FOOTAGE_INDEX_ID = process.env.TWELVELABS_FOOTAGE_INDEX_ID;
  const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

  if (!API_KEY || !FOOTAGE_INDEX_ID) {
    return NextResponse.json(
      { error: "API key or Index ID is not set" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || 1;

  const url = `${TWELVELABS_API_BASE_URL}/indexes/${FOOTAGE_INDEX_ID}/videos?page_limit=9&page=${page}`;

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

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
