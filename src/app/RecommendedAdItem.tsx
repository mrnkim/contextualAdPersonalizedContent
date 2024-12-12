import React from 'react'
import RecommendedAd from './RecommendedAd';
import { useQuery } from '@tanstack/react-query';
import { RecommendedAdProps, VideoDetails } from './types';
import { fetchVideoDetails } from '@/hooks/apiHooks';

    const RecommendedAdItem = ({ recommendedAd, adsIndexId }: { recommendedAd: RecommendedAdProps["recommendedAd"], adsIndexId: string }) => {
        const { data: videoDetails } = useQuery<VideoDetails, Error>({
          queryKey: ["videoDetails", recommendedAd.id],
          queryFn: () => fetchVideoDetails(recommendedAd.id!, adsIndexId),
          enabled: !!recommendedAd.id && !!adsIndexId
        });

        return (
          <div className="flex flex-col p-2">
            {videoDetails?.metadata.filename && (
              <h3 className="mb-2 text-lg font-medium">
                {videoDetails.metadata.filename.split('.')[0]}
              </h3>
            )}
            {videoDetails && (
              <RecommendedAd
                recommendedAd={{ ...recommendedAd, clips: recommendedAd.clips || [] }}
                indexId={adsIndexId}
                videoDetails={videoDetails}
              />
            )}
          </div>
        );
      };

export default RecommendedAdItem
