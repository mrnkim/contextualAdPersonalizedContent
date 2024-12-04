import { NextResponse } from "next/server";

export const maxDuration = 60;

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const indexId = searchParams.get("indexId");
    const query = searchParams.get("query");
    const searchOptionsString = searchParams.get("searchOptions");
    const pageLimit = searchParams.get("pageLimit");
    const searchOptions = searchOptionsString ? searchOptionsString.split(',') : [];

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
            body: JSON.stringify({
                query: query,
                index_id: indexId,
                search_options: searchOptions,
                group_by: "video",
                page_limit: parseInt(pageLimit ?? "4"),
                threshold: "medium"
            })
          };
          console.log("🚀 > GET > body=", options.body)

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        if (!responseData) {
          throw new Error("Empty response from API");
        }

        return NextResponse.json(responseData, { status: 200 });
      } catch (error) {
        console.error("Error in GET function:", error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Internal Server Error" },
          { status: 500 }
        );
      }
}
