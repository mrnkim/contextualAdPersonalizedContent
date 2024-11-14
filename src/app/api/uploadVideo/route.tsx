import { TwelveLabs } from 'twelvelabs-js';
import { NextResponse } from "next/server";
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const maxDuration = 60;

const API_KEY = process.env.TWELVELABS_API_KEY;
if (!API_KEY) throw new Error('TWELVELABS_API_KEY is not defined');

const client = new TwelveLabs({ apiKey: API_KEY});

export async function POST(req: Request) {
  let tempFilePath: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const indexId = formData.get('indexId') as string;

    if (!indexId || !file) {
      return NextResponse.json(
        { error: "indexId and file are required" },
        { status: 400 }
      );
    }

    // Save the file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    tempFilePath = path.join('/tmp', file.name);
    await writeFile(tempFilePath, buffer);

    const task = await client.task.create({
      indexId: indexId,
      file: tempFilePath,
    });

    return NextResponse.json({ status: task.status, taskId: task.id }, { status: 200 });
  } catch (error) {
    console.error("Error in POST function:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Delete the temporary file if it was created
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log(`Temporary file ${tempFilePath} has been deleted.`);
      } catch (unlinkError) {
        console.error(`Failed to delete temporary file ${tempFilePath}:`, unlinkError);
      }
    }
  }
}
