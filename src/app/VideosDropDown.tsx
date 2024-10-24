import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVideos } from '@/hooks/apiHooks';
import { Video } from './types';
import { MenuItem, Select, Skeleton, SelectChangeEvent } from '@mui/material'
import clsx from 'clsx';

interface VideosDropDownProps {
  indexId: string;
  onVideoChange: (selectedVideoId: string) => void;
}

const VideosDropDown: React.FC<VideosDropDownProps> = ({ indexId, onVideoChange }) => {
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

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newVideoId = event.target.value;
    setSelectedVideoId(newVideoId);
    onVideoChange(newVideoId);
  };

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
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

  const ITEM_HEIGHT = 48;
  const MENU_MAX_HEIGHT = 5 * ITEM_HEIGHT;

  return (
    <div className="relative">
      <Select
        value={selectedVideoId || ""}
        onChange={handleChange}
        className={clsx('h-9 w-full tablet:w-[200px]', 'bg-white', 'pl-[1px]', 'truncate text-ellipsis')}
        renderValue={(value) => (
          <div className="truncate">
            {data?.pages.flatMap(page => page.data).find(video => video._id === value)?.metadata.filename || "Select a video"}
          </div>
        )}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: MENU_MAX_HEIGHT,
              width: 200
            }
          },
          MenuListProps: {
            sx: {
              padding: 0,
              maxHeight: MENU_MAX_HEIGHT,
              overflowY: 'auto',
              overflowX: 'hidden'
            },
            onScroll: handleScroll
          }
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6BDE11',
            borderWidth: '1px',
            borderRadius: '0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6BDE11',
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6BDE11',
            borderWidth: '1px',
          },
          '& .MuiSelect-select': {
            padding: '8px 14px',
            borderRadius: '0',
          },
          '& .MuiSelect-icon': {
            right: '7px',
          },
          '& .MuiOutlinedInput-input': {
            padding: '8px 14px',
            borderRadius: '0',
          },
          '& .MuiInputBase-root': {
            borderRadius: '0',
          },
          '& .MuiSelect-outlined': {
            borderRadius: '0',
          },
        }}
      >
        {data?.pages.flatMap((page, pageIndex) =>
          page.data.map((video: Video) => (
            <MenuItem
              key={`${pageIndex}-${video._id}`}
              value={video._id}
              sx={{
                paddingX: 1.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                display: 'block',
                width: '100%'
              }}
            >
              {video.metadata.filename}
            </MenuItem>
          ))
        )}
        {isFetchingNextPage && (
          <MenuItem disabled sx={{ alignItems: 'flex-start', flexDirection: 'column', paddingX: 1.5 }}>
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={180} sx={{ mt: 0.5 }} />
          </MenuItem>
        )}
      </Select>
    </div>
  );
};

export default VideosDropDown;
