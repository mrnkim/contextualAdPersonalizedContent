import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

// Define a basic interface for the expected response data structure
interface VideoApiResponse {
  hls?: Record<string, unknown>; // Or a more specific HLS type if available
  metadata?: Record<string, unknown>; // Or a more specific Metadata type
  source?: Record<string, unknown>; // Or a more specific Source type
  embedding?: Record<string, unknown>; // Or a more specific Embedding type
}

// Type guard to check if the video object is valid and has expected properties
function isValidVideoData(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const indexId = searchParams.get("indexId");
  // Still accept 'embed' from frontend, interpret as request for embedding
  const requestEmbeddings = searchParams.get("embed") === 'true';

  if (!indexId) {
    return NextResponse.json(
      { error: "indexId is required" },
      { status: 400 }
    );
  }

  if (!videoId) {
    return NextResponse.json(
      { error: "videoId is required" },
      { status: 400 }
    );
  }

  // Base URL
  let url = `${TWELVELABS_API_BASE_URL}/indexes/${indexId}/videos/${videoId}`;

  // Append correct query parameters if embeddings are requested
  if (requestEmbeddings) {
    // Append each embedding option as a separate parameter
    url += `?embedding_option=visual-text&embedding_option=audio`;
  }

  const options = {
    method: "GET",
    headers: {
      // Removed incorrect Content-Type for GET request
      "x-api-key": `${API_KEY}`,
      "Accept": "application/json" // Added Accept header
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    // Use unknown type and a type guard for safer handling
    const videoData: unknown = await response.json();

    // Validate the received data structure
    if (!isValidVideoData(videoData)) {
      throw new Error("Invalid video data structure received.");
    }

    // Log the entire object received from TwelveLabs for debugging

    // Prepare response data using the defined interface
    const responseData: VideoApiResponse = {
      hls: videoData.hls as Record<string, unknown> | undefined,
      // Use system_metadata as per documentation, handle if missing
      metadata: (videoData.system_metadata || videoData.metadata) as Record<string, unknown> | undefined,
      source: videoData.source as Record<string, unknown> | undefined,
    };

    // Check if the 'embedding' field exists in the response from TwelveLabs
    if ('embedding' in videoData && videoData.embedding) {
      responseData.embedding = videoData.embedding as Record<string, unknown>;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
