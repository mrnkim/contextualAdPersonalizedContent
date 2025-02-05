import React from 'react'
import RecommendedAd from './RecommendedAd';
import { useQuery } from '@tanstack/react-query';
import { RecommendedAdItemProps, VideoDetails } from '@/app/types';
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
                  <h3 className="font-medium">
                    {videoDetails.metadata.filename.split('.')[0]}
                  </h3>
                  {score && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-moss_green-200 whitespace-nowrap">
                      <img
                        src={"/score.svg"}
                        alt="score icon"
                        className="w-4 h-4"
                      /> {Math.round(score)}
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
