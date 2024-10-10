import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;
const SEARH_OPTIONS=[
    "visual",
    "conversation",
    "text_in_video",
    "logo"
  ]

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const indexId = searchParams.get("indexId");
    const query = searchParams.get("query");

    if (!indexId) {
      return NextResponse.json(
        { error: "indexId is required" },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

      const url = `${TWELVELABS_API_BASE_URL}/search`;
      const options = {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "x-api-key": `${API_KEY}`,
            },
            body: JSON.stringify({query: query, index_id: indexId, search_options: SEARH_OPTIONS, group_by: "video"})
        };

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        if (!responseData) {
          throw new Error("Empty response from API");
        }

        const data = JSON.parse(responseData);

        return NextResponse.json(data.data,{ status: 200 });
      } catch (error) {
        console.error("Error in GET function:", error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Internal Server Error" },
          { status: 500 }
        );
      }
}