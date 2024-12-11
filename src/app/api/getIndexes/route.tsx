import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const pageLimit = searchParams.get("pageLimit");

  const url = `${TWELVELABS_API_BASE_URL}/indexes?page=${page}&page_limit=${pageLimit}`;

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

    const data = await response.json();
    console.log("🚀 > GET > data=", data)
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
