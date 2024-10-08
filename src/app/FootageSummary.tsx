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
      const [label, content] = section.split(': ');
      return (
        <div key={index} className="mb-4">
          <strong>{label}:</strong> {content}
        </div>
      );
    });
  };

  if (isGistLoading || isCustomTextsLoading) return <LoadingSpinner />;
  if (gistError || customTextsError) return <ErrorFallback error={gistError || customTextsError || new Error('Unknown error')} />;

  return (
    <div className="mt-4">
      <div className="mb-2">
        <strong>Title:</strong> {gistData.title}
      </div>
      <div className="mb-2">
        <strong>Topics:</strong> {gistData.topics}
      </div>
      <div className="mb-2">
        <strong>Hashtags:</strong> {gistData.hashtags.map((tag: string) => `#${tag?.trim()}`).join(' ')}
      </div>
      <div className="mb-2">
        <div className="mt-2">
          {formatCustomTexts(customTextsData) || ''}
        </div>
      </div>
    </div>
  );
}

export default FootageSummary;
