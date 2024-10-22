import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { generateGist, generateCustomTexts } from '@/hooks/apiHooks';
import { FootageSummaryProps, GistData } from './types';

const PROMPT = "Summarize the video focusing on the event type, main content, and the emotional tone. Provide the titles (Event Type, Main Content, Emotional Tone) before each summary. Do not include any introductory text or comments. Start straight away with the summary."

function FootageSummary({ videoId, setHashtags }: FootageSummaryProps) {

  const { data: gistData, error: gistError, isLoading: isGistLoading } = useQuery<GistData, Error>({
    queryKey: ["gist", videoId],
    queryFn: () => generateGist(videoId),
  });

  useEffect(() => {
    if (gistData?.hashtags) {
      setHashtags(gistData.hashtags);
    }
  }, [gistData, setHashtags]);

  const { data: customTextsData, error: customTextsError, isLoading: isCustomTextsLoading } = useQuery({
    queryKey: ["customTexts", videoId],
    queryFn: () => generateCustomTexts(videoId, PROMPT),
  });

  const formatCustomTexts = (data: string) => {
    const sections = ["Event Type", "Main Content", "Emotional Tone"];
    return sections.map((section, index) => {
      const regex = new RegExp(`${section}:\\s*(.+?)(?=\\n(?:Event Type|Main Content|Emotional Tone):|$)`, 's');
      const match = data.match(regex);
      const content = match ? match[1]?.trim() : '';
      return (
        <div key={index} className="mb-6">
          <h3 className="font-bold text-lg mb-2">{section}</h3>
          <p>{content}</p>
        </div>
      );
    });
  };

  const renderGistData = () => {
    if (!gistData) return null;
    return (
      <>
        <div className="mb-5">
          {gistData?.hashtags?.map((tag: string) => `#${tag?.trim()}`).join(' ')}
        </div>
      </>
    );
  };

  const renderCustomTexts = () => {
    if (!customTextsData) return null;
    return (
      <div className="mb-2">
        {formatCustomTexts(customTextsData)}
      </div>
    );
  };

  return (
    <div className="mt-4">
      {(isGistLoading || isCustomTextsLoading) ? (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {renderGistData()}
          {renderCustomTexts()}
        </>
      )}
      {(gistError || customTextsError) && <ErrorFallback error={gistError || customTextsError || new Error('Unknown error')} />}
    </div>
  );
}

export default FootageSummary;
