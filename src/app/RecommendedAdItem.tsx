import React from 'react'
import RecommendedAd from './RecommendedAd';
import { useQuery } from '@tanstack/react-query';
import { RecommendedAdItemProps, VideoDetails } from './types';
import { fetchVideoDetails } from '@/hooks/apiHooks';

    const RecommendedAdItem = ({ recommendedAd, adsIndexId, score }: RecommendedAdItemProps) => {
        const { data: videoDetails } = useQuery<VideoDetails, Error>({
          queryKey: ["videoDetails", recommendedAd.id],
          queryFn: () => fetchVideoDetails(recommendedAd.id!, adsIndexId),
          enabled: !!recommendedAd.id && !!adsIndexId
        });

        return (
          <div className="flex flex-col p-2">
            {videoDetails?.metadata.filename && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">
                    {videoDetails.metadata.filename.split('.')[0]}
                  </h3>
                  {score && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-moss_green-200">
                      Score: {Math.round(score)}
                    </span>
                  )}
                </div>
              </div>
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
