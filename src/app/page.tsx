"use client";

import Footage from "./Footage";
import Ads from "./Ads";
import React, { useState } from "react";

export default function Home() {
const [hashtags, setHashtags] = useState<string[]>([]);

  return (
    <main className="flex min-h-screen p-24">
      <div className="flex w-full max-w-7xl mx-auto">
        <div className="w-1/2 pr-4">
          <Footage setHashtags={setHashtags} />
        </div>
        <div className="w-1/2 pl-4">
          <Ads hashtags={hashtags} />
        </div>
      </div>
    </main>
  );
}
