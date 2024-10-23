import React, { useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchVideos } from '@/hooks/apiHooks';
import { Video } from './types';

interface VideosDropDownProps {
  indexId: string;
  onVideoChange: (videoId: string) => void;
}

const VideosDropDown: React.FC<VideosDropDownProps> = ({ indexId, onVideoChange }) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const { data: videosData, isLoading: isVideosLoading } = useQuery<{
    data: Video[];
    page_info: {
      limit_per_page: number;
      page: number;
      total_page: number;
      total_results: number;
    };
  }>({
    queryKey: ['videos', indexId],
    queryFn: () => fetchVideos(1, indexId),
    enabled: !!indexId,
  });

  const handleChange = () => {
    if (selectRef.current) {
      onVideoChange(selectRef.current.value);
    }
  };

  if (isVideosLoading) {
    return <div>Loading videos...</div>;
  }

  return (
    <select ref={selectRef} onChange={handleChange} defaultValue="">
      <option value="">Select a video</option>
      {videosData?.data.map((video) => (
        <option key={video._id} value={video._id}>
          {video.metadata.filename} ({new Date(video.created_at).toLocaleString()})
        </option>
      ))}
    </select>
  );
};

export default VideosDropDown;
