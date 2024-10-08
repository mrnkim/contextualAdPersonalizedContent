import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const API_KEY = process.env.TWELVELABS_API_KEY;
    const FOOTAGE_INDEDX_ID = process.env.TWELVELABS_FOOTAGE_INDEX_ID;
    const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

    if (!API_KEY || !FOOTAGE_INDEDX_ID) {
      return NextResponse.json(
        { error: "API key or Index ID is not set" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const VIDEO_ID = searchParams.get("videoId");
    const PROMPT = "Summarize the video focusing on the event type, main content, and the emotional tone. Provide the titles (Event Type, Main Content, Emotional Tone) before each summary. Do not include any introductory text or comments. Start straight away with the summary."

      const url = `${TWELVELABS_API_BASE_URL}/generate`;
      const options = {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "x-api-key": `${API_KEY}`,
            },
            body: JSON.stringify({prompt: PROMPT, video_id: `${VIDEO_ID}`})
        };

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();

        if (!responseText) {
          throw new Error("Empty response from API");
        }

        const data = JSON.parse(responseText);

        return NextResponse.json(data.data,{ status: 200 });
      } catch (error) {
        console.error("Error in GET function:", error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Internal Server Error" },
          { status: 500 }
        );
      }
}