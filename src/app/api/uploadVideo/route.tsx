import { TwelveLabs, Task } from 'twelvelabs-js';
import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

const client = new TwelveLabs({ apiKey: API_KEY});

export async function POST(req: Request) {
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
    const tempFilePath = path.join('/tmp', file.name);
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
  }
}
