import React from 'react';
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';

interface FootageSummaryProps {
  videoId: string;
}

function FootageSummary({ videoId }: FootageSummaryProps) {
  const generateGist = async () => {
    const response = await fetch(`/api/generateGist?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
    }
    return response.json();
  };

  const { data: gistData, error: gistError, isLoading: isGistLoading } = useQuery({
    queryKey: ["gist", videoId],
    queryFn: generateGist,
  });

  const generateCustomTexts = async (): Promise<void> => {
    const response = await fetch(`/api/generateCustomTexts?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
    }
    return response.json();
  };

  const { data: customTextsData, error: customTextsError, isLoading: isCustomTextsLoading } = useQuery({
    queryKey: ["customTexts", videoId],
    queryFn: generateCustomTexts,
  });

  const formatCustomTexts = (data: string) => {
    const sections = data.split('\n\n');
    return sections.map((section, index) => {
      const [label, ...contentParts] = section.split(':');
      const content = contentParts.join(':').trim();
      return (
        <div key={index} className="mb-6">
          <h3 className="font-bold text-lg mb-2">{label}</h3>
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
          {gistData.hashtags.map((tag: string) => `#${tag?.trim()}`).join(' ')}
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
