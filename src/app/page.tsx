"use client";

import { useState } from 'react';
import Footage from './Footage';
import Ads from './Ads';

const footageIndexId = process.env.NEXT_PUBLIC_FOOTAGE_INDEX_ID;
const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [footageVideoId, setFootageVideoId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecommendClicked, setIsRecommendClicked] = useState(false);

  return (
    <main className="flex min-h-screen p-24">
      <div className="flex w-full max-w-7xl mx-auto">
        <div className="w-2/3 pr-4">
          <Footage
            setHashtags={setHashtags}
            // indexId={footageIndexId ?? ''}
            isIndexIdLoading={!footageIndexId}
            footageVideoId={footageVideoId}
            setFootageVideoId={setFootageVideoId}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setIsRecommendClicked={setIsRecommendClicked}
          />
        </div>
        <div className="w-1/6"></div>
        <div className="w-2/3 pl-4">
          <Ads
            hashtags={hashtags}
            setHashtags={setHashtags}
            indexId={adsIndexId ?? ''}
            isIndexIdLoading={!adsIndexId}
            footageVideoId={footageVideoId}
            selectedFile={selectedFile}
            isRecommendClicked={isRecommendClicked}
            setIsRecommendClicked={setIsRecommendClicked}
          />
        </div>
      </div>
    </main>
  );
}
