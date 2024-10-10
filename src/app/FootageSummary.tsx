import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { generateGist, generateCustomTexts } from '@/hooks/apiHooks';

interface FootageSummaryProps {
  videoId: string;
  setHashtags: (hashtags: string[]) => void;
}

interface GistData {
  hashtags: string[];
}

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
    queryFn: () => generateCustomTexts(videoId),
  });

  const formatCustomTexts = (data: string) => {
    const sections = ["Event Type", "Main Content", "Emotional Tone"];
    return sections.map((section, index) => {
      const regex = new RegExp(`${section}:\\s*(.+?)(?=\\n(?:Event Type|Main Content|Emotional Tone):|$)`, 's');
      const match = data.match(regex);
      const content = match ? match[1].trim() : '';
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
        {/* <div className="mb-2">
          <strong>Title:</strong> {gistData.title}
        </div>
        <div className="mb-2">
          <strong>Topics:</strong> {gistData.topics}
        </div> */}
        <div className="mb-2">
          {/* <strong>Hashtags:</strong> */}
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

  if (isGistLoading && isCustomTextsLoading) return <LoadingSpinner />;
  if (gistError && customTextsError) return <ErrorFallback error={new Error('Failed to load data')} />;

  return (
    <div className="mt-4">
      {renderGistData()}
      {renderCustomTexts()}
      {(isGistLoading || isCustomTextsLoading) && <LoadingSpinner />}
      {(gistError || customTextsError) && <ErrorFallback error={gistError || customTextsError || new Error('Unknown error')} />}
    </div>
  );
}

export default FootageSummary;
