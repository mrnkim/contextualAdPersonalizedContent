import { NextResponse } from "next/server";

export const maxDuration = 60;

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const indexId = searchParams.get("indexId");
    const query = searchParams.get("query");
    console.log("🚀 > GET > query=", query)
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
      const formData = new FormData();
      formData.append('query_text', query);
      formData.append('index_id', indexId);
      searchOptions.forEach(option => {
          formData.append('search_options', option);
      });
      formData.append('group_by', 'video');
      formData.append('page_limit', pageLimit ?? '4');
      formData.append('threshold', 'medium');

      const options = {
          method: "POST",
          headers: {
              "accept": "application/json",
              "x-api-key": `${API_KEY}`,
          },
          body: formData
      };

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Network response was not ok: ${response.status} ${response.statusText}. Response body: ${errorText}`);
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("🚀 > GET > responseData=", responseData)

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
