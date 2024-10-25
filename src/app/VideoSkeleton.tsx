import React from 'react';
import { Skeleton } from '@mui/material';

const VideoSkeleton: React.FC = () => {
  return (
    <Skeleton
      variant="rectangular"
      width="100%"
      height="100%"
      animation="wave"
      sx={{
        aspectRatio: '16 / 9',
        borderRadius: 1
      }}
    />
  );
};

export default VideoSkeleton;