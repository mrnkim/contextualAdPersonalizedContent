import React, { useState, useRef, useEffect, useMemo } from 'react'
import { generateCustomTexts } from '@/hooks/apiHooks';
import { RecommendedAdProps, ContextualAdsProps } from '@/app/types';
import Footage from '@/app/components/Footage';
import Ads from '@/app/components/Ads';
import RecommendedAds from '@/app/components/RecommendedAds';
import { useQuery } from '@tanstack/react-query';

const footageIndexId = process.env.NEXT_PUBLIC_FOOTAGE_INDEX_ID;
const HASHTAGS_PROMPT = "Generate a list of 3 hashtags that best describe the video. Do not include any introductory text or comments."
const PROMPT = "Summarize the video focusing on the event type, main content, and the emotional tone. Provide the titles (Event Type, Main Content, Emotional Tone) before each summary. Do not include any introductory text or comments. For Emotional Tone, start with three words and a period."

const ContextualAds = ({ adsIndexId, hasProcessedAds, setHasProcessedAds, hasProcessedFootage, setHasProcessedFootage, useEmbeddings }: ContextualAdsProps) => {
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

    const { data:gistData, isLoading: isGistLoading, error: gistDataError } = useQuery<string, Error>({
        queryKey: ["hashtags", footageVideoId],
        queryFn: () => generateCustomTexts(footageVideoId, HASHTAGS_PROMPT),
        enabled: !!footageVideoId && !!isAnalyzeClicked,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    });

    const { data: rawCustomTextsData, isLoading: isCustomTextsLoading, error: customTextsError } = useQuery<string, Error>({
        queryKey: ["summary", footageVideoId],
        queryFn: () => generateCustomTexts(footageVideoId, PROMPT),
        enabled: !!footageVideoId && !!isAnalyzeClicked,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    });

    const customTextsData = useMemo(() => rawCustomTextsData, [rawCustomTextsData]);

    useEffect(() => {
        if (gistData) {
            setHashtags(gistData.split("#").filter(tag => tag.trim() !== ""));
        }
    }, [gistData]);

    useEffect(() => {
        if (customTextsData) {
            const emotionalTones: string[] = [];
            const matches = customTextsData.match(/Emotional Tone[:\s]*([^]+)/);

            if (matches && matches[1]) {
                const words = matches[1]
                    .trim()
                    .split(/[,.\s]+/)
                    .filter(word => {
                        return (
                            word &&
                            word !== 'and' &&
                            word !== ':' &&
                            /^[a-zA-Z]+$/.test(word)
                        );
                    });
                emotionalTones.push(...words.slice(0, 3));
            }
            setEmotions(emotionalTones);
        }
    }, [customTextsData]);

    return (
        <div>
            <h1 className="text-3xl font-bold mx-auto mb-6">Contextual Ads</h1>
            <div className="mb-16 mx-auto">Contextual Ad is a tool for analyzing source footage, summarizing content, and recommending ads based on the footage’s context and emotional tone. It also supports embedding-based searches and suggests optimal ad placements, letting you preview how the footage and ads fit together. Additionally, it generates ad copies, headlines, and hashtags for each ad!</div>
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
                        gistData={gistData ?? ""}
                        customTextsData={customTextsData ?? ""}
                        isLoading={isGistLoading || isCustomTextsLoading}
                        error={gistDataError || customTextsError}
                        setIsRecommendClickedEver={setIsRecommendClickedEver}
                        setSelectedAd={setSelectedAd}
                        setSelectedChapter={setSelectedChapter}
                        isAnalyzeClicked={isAnalyzeClicked}
                        setIsAnalyzeClicked={setIsAnalyzeClicked}
                        hasProcessedFootage={hasProcessedFootage}
                        setHasProcessedFootage={setHasProcessedFootage}
                        useEmbeddings={useEmbeddings}
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
                        hashtags={hashtags}
                        hasProcessedAds={hasProcessedAds}
                        setHasProcessedAds={setHasProcessedAds}
                        hasProcessedFootage={hasProcessedFootage}
                        useEmbeddings={useEmbeddings}
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
                        useEmbeddings={useEmbeddings}
                    />
                </div>
            )}
        </div>
    )
}

export default ContextualAds
