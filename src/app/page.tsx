import React from "react";
import Footage from "./Footage";
import Ads from "./Ads";


export default function Home() {
  return (
    <main className="flex min-h-screen p-24">
      <div className="flex w-full max-w-7xl mx-auto">
        <div className="w-1/2 pr-4">
          <Footage />
        </div>
        <div className="w-1/2 pl-4">
          <Ads />
        </div>
      </div>
    </main>
  );
}
