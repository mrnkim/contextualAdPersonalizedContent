import React, { useRef, useEffect, useState } from 'react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVideos } from '@/hooks/apiHooks';
import { Video } from './types';

interface VideosDropDownProps {
  indexId: string;
  onVideoChange: (videoId: string) => void;
}

const VideosDropDown: React.FC<VideosDropDownProps> = ({ indexId, onVideoChange }) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['videos', indexId],
    queryFn: ({ pageParam }) => fetchVideos(pageParam, indexId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page_info.page < lastPage.page_info.total_page) {
        return lastPage.page_info.page + 1;
      }
      return undefined;
    },
    enabled: !!indexId,
  });

  useEffect(() => {
    if (data?.pages[0]?.data && data.pages[0].data.length > 0 && !selectedVideoId) {
      const firstVideoId = data.pages[0].data[0]._id;
      setSelectedVideoId(firstVideoId);
      onVideoChange(firstVideoId);
    }
  }, [data, onVideoChange, selectedVideoId]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newVideoId = event.target.value;
    setSelectedVideoId(newVideoId);
    onVideoChange(newVideoId);
    setIsOpen(false);
  };

  const handleScroll = (event: React.UIEvent<HTMLSelectElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  return (
    <div className="relative">
      <select
        ref={selectRef}
        onChange={handleChange}
        onScroll={handleScroll}
        value={selectedVideoId || ""}
        className="w-full p-2 border rounded"
        size={isOpen ? 5 : 1}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {data?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.data.map((video: Video) => (
              <option key={video._id} value={video._id}>
                {video.metadata.filename}
              </option>
            ))}
          </React.Fragment>
        ))}
      </select>
      {isFetchingNextPage && <div className="text-center mt-2">Loading more...</div>}
    </div>
  );
};

export default VideosDropDown;
