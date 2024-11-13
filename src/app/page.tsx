"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Footage from './Footage';
import Ads from './Ads';
import RecommendedAds from './RecommendedAds'
import { useQuery } from "@tanstack/react-query";
import { generateGist, generateCustomTexts } from '@/hooks/apiHooks';
import { GistData, RecommendedAdProps } from './types';

const footageIndexId = process.env.NEXT_PUBLIC_FOOTAGE_INDEX_ID;
const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

const PROMPT = "Summarize the video focusing on the event type, main content, and the emotional tone. Provide the titles (Event Type, Main Content, Emotional Tone) before each summary. Do not include any introductory text or comments. Start straight away with the summary. For Emotional Tone, start with three words and a period then add more as needed."

export default function Page() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [footageVideoId, setFootageVideoId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAd, setSelectedAd] = useState<RecommendedAdProps["recommendedAd"] | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isRecommendClicked, setIsRecommendClicked] = useState(false);
  const [isRecommendClickedEver, setIsRecommendClickedEver] = useState(false);
  const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);

  const searchOptionRef = useRef<HTMLFormElement>(null);
  const customQueryRef = useRef<HTMLInputElement>(null);

  const { data: gistData, isLoading: isGistLoading, error: gistDataError } = useQuery<GistData, Error>({
    queryKey: ["gist", footageVideoId],
    queryFn: () => generateGist(footageVideoId),
    enabled: !!footageVideoId && !!isAnalyzeClicked
  });

  const { data: rawCustomTextsData, isLoading: isCustomTextsLoading, error: customTextsError } = useQuery<string, Error>({
    queryKey: ["customTexts", footageVideoId],
    queryFn: () => generateCustomTexts(footageVideoId, PROMPT),
    enabled: !!footageVideoId && !!isAnalyzeClicked,
    refetchOnWindowFocus: false,
  });

  const customTextsData = useMemo(() => rawCustomTextsData, [rawCustomTextsData]);

  useEffect(() => {
    if (gistData?.hashtags) {
      setHashtags(gistData.hashtags);
    }
  }, [gistData]);

  useEffect(() => {
    if (customTextsData) {
      const emotionalToneRegex = /Emotional Tone:\s*([^.]+)\./;
      const match = (customTextsData as string).match(emotionalToneRegex);
      if (match && match[1]) {
        const firstThreeWords = match[1]?.trim()?.split(/\s+/)?.slice(0, 3);
        setEmotions(firstThreeWords);
      }
    }
  }, [customTextsData]);

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
            gistData={gistData || { hashtags: [] }}
            customTextsData={customTextsData ?? ""}
            isLoading={isGistLoading || isCustomTextsLoading}
            error={gistDataError || customTextsError}
            setIsRecommendClickedEver={setIsRecommendClickedEver}
            setSelectedAd={setSelectedAd}
            setSelectedChapter={setSelectedChapter}
            isAnalyzeClicked={isAnalyzeClicked}
            setIsAnalyzeClicked={setIsAnalyzeClicked}
          />
        </div>
        <div className="w-1/6"></div>
        <div className="w-2/3 pl-4">
          <Ads
            indexId={adsIndexId ?? ''}
            isIndexIdLoading={!adsIndexId}
            selectedFile={selectedFile}
            isRecommendClicked={isRecommendClicked}
            setIsRecommendClicked={setIsRecommendClicked}
            searchOptionRef={searchOptionRef}
            customQueryRef={customQueryRef}
            isAnalysisLoading={isGistLoading || isCustomTextsLoading}
            setIsRecommendClickedEver={setIsRecommendClickedEver}
            isRecommendClickedEver={isRecommendClickedEver}
            setSelectedAd={setSelectedAd}
            setSelectedChapter={setSelectedChapter}
            customTextsData={customTextsData ?? ""}
          />
        </div>
      </div>
      {isRecommendClickedEver && !selectedFile && (
        <div className="w-3/4 mx-auto">
          <RecommendedAds
            hashtags={hashtags}
            footageVideoId={footageVideoId}
            footageIndexId={footageIndexId ?? ''}
            adsIndexId={adsIndexId ?? ''}
            selectedFile={selectedFile}
            isRecommendClicked={isRecommendClicked}
            setIsRecommendClicked={setIsRecommendClicked}
            searchOptionRef={searchOptionRef}
            customQueryRef={customQueryRef}
            emotions={emotions}
            selectedAd={selectedAd}
            setSelectedAd={setSelectedAd}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
          />
        </div>
      )}
    </main>
  );
}
