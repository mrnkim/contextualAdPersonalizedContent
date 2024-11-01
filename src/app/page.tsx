"use client";

import { useState, useRef } from 'react';
import Footage from './Footage';
import Ads from './Ads';
import RecommendedAds from './RecommendedAds'
import RecommendedPlacements from './RecommendedPlacements';

const footageIndexId = process.env.NEXT_PUBLIC_FOOTAGE_INDEX_ID;
const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [footageVideoId, setFootageVideoId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecommendClicked, setIsRecommendClicked] = useState(false);

  const searchOptionRef = useRef<HTMLFormElement>(null);
  const customQueryRef = useRef<HTMLInputElement>(null);

  return (
    <main className="flex flex-col min-h-screen p-24">
      <div className="flex w-full max-w-7xl mx-auto">
        <div className="w-2/3 pr-4">
          <Footage
            hashtags={hashtags}
            setHashtags={setHashtags}
            indexId={footageIndexId ?? ''}
            isIndexIdLoading={!footageIndexId}
            footageVideoId ={footageVideoId}
            setFootageVideoId={setFootageVideoId}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setIsRecommendClicked={setIsRecommendClicked}
            emotions={emotions}
            setEmotions={setEmotions}
          />
        </div>
        <div className="w-1/6"></div>
        <div className="w-2/3 pl-4">
          <Ads
            hashtags={hashtags}
            setHashtags={setHashtags}
            indexId={adsIndexId ?? ''}
            isIndexIdLoading={!adsIndexId}
            footageVideoId ={footageVideoId}
            selectedFile={selectedFile}
            isRecommendClicked={isRecommendClicked}
            setIsRecommendClicked={setIsRecommendClicked}
            emotions={emotions}
            searchOptionRef={searchOptionRef}
            customQueryRef={customQueryRef}
          />
        </div>
      </div>
      {isRecommendClicked && !selectedFile && (
        <div className="w-3/4 mt-4 mx-auto">
          <RecommendedAds
            hashtags={hashtags}
            setHashtags={setHashtags}
            footageVideoId={footageVideoId}
            indexId={adsIndexId ?? ''}
            selectedFile={selectedFile}
            setIsRecommendClicked={setIsRecommendClicked}
            searchOptionRef={searchOptionRef}
            customQueryRef={customQueryRef}
            emotions={emotions}
          />
        </div>
      )}
      {isRecommendClicked && !selectedFile && (
        <div className="w-3/4 mt-4 mx-auto">
          <RecommendedPlacements
            indexId={footageIndexId ?? ''}
            footageVideoId ={footageVideoId}
          />
        </div>
      )}
    </main>
  );
}
