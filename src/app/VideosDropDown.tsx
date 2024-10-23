import React, { useRef, useEffect } from 'react';
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

  // 컴포넌트가 마운트되거나 videosData가 변경될 때 첫 번째 비디오 선택
  useEffect(() => {
    if (videosData?.data && videosData.data.length > 0) {
      onVideoChange(videosData.data[0]._id);
    }
  }, [videosData, onVideoChange]);

  const handleChange = () => {
    if (selectRef.current) {
      onVideoChange(selectRef.current.value);
    }
  };

  if (isVideosLoading) {
    return <div>Loading videos...</div>;
  }

  return (
    <select ref={selectRef} onChange={handleChange} value={videosData?.data[0]?._id || ""}>
      {videosData?.data.map((video) => (
        <option key={video._id} value={video._id}>
          {video.metadata.filename}
        </option>
      ))}
    </select>
  );
};

export default VideosDropDown;
