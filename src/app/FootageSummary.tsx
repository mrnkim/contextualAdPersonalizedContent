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

  const { data, error, isLoading } = useQuery({
    queryKey: ["gist", videoId],
    queryFn: generateGist,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorFallback error={error} />;

  return (
    <div className="mt-4">
      <div className="mb-2">
        <strong>Title:</strong> {data.title}
      </div>
      <div className="mb-2">
        <strong>Topics:</strong> {data.topics}
      </div>
      <div className="mb-2">
        <strong>Hashtags:</strong> {data.hashtags.map((tag: string) => `#${tag?.trim()}`).join(' ')}
      </div>
    </div>
  );
}

export default FootageSummary;
