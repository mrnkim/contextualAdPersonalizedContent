import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export const maxDuration = 60;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const prompt = searchParams.get("prompt");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      );
    }

      const url = `${TWELVELABS_API_BASE_URL}/generate`;
      const options = {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "x-api-key": `${API_KEY}`,
            },
            body: JSON.stringify({prompt: prompt, video_id: `${videoId}`, stream: false})
        };

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log("🚀 > GET > responseText=", responseText)

        if (!responseText) {
          throw new Error("Empty response from API");
        }

        const data = JSON.parse(responseText);

        // Convert the data field to an array by splitting the string
        const dataArray = data.data.split(" ");

        return NextResponse.json(dataArray, { status: 200 });
      } catch (error) {
        console.error("Error in GET function:", error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Internal Server Error" },
          { status: 500 }
        );
      }
}