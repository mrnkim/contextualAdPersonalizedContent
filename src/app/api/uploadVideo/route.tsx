import { NextResponse } from "next/server";

export const maxDuration = 60;

const API_KEY = process.env.TWELVELABS_API_KEY;
if (!API_KEY) throw new Error('TWELVELABS_API_KEY is not defined');

export async function POST(req: Request) {
  try {
    console.log('POST request received');
    const formData = await req.formData();
    console.log('FormData received:', {
      hasFile: formData.has('file'),
      hasIndexId: formData.has('indexId')
    });

    const file = formData.get('file') as File;
    const indexId = formData.get('indexId') as string;
    console.log('Extracted data:', {
      fileSize: file?.size,
      fileType: file?.type,
      indexId
    });

    if (!indexId || !file) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: "indexId and file are required" },
        { status: 400 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append('index_id', indexId);
    apiFormData.append('video_file', file);
    console.log('Preparing API request to TwelveLabs');

    const response = await fetch('https://api.twelvelabs.io/v1.2/tasks', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY as string,
      },
      body: apiFormData
    });

    console.log('API Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`API error: ${response.status} - ${responseText}`);
    }

    const data = await response.json();
    console.log('API Success response:', data);
    return NextResponse.json({ taskId: data._id }, { status: 200 });
  } catch (error) {
    console.error("Error in POST function:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
