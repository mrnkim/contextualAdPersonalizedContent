import React, {useState, Suspense, useMemo} from 'react'
import Video from './Video'
import Button from './Button'
import AdCopy from './AdCopy';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import LoadingSpinner from './LoadingSpinner';
import { RecommendedAdProps } from '@/app/types';
import { useQuery } from "@tanstack/react-query"
import { generateCustomTexts } from "@/hooks/apiHooks";
import { usePlayer } from '@/contexts/PlayerContext';

const AD_COPY_PROMPT = "Generate three sets of ad copy details based on the video. Each set should include: Headline, Ad Copy, and Hashtags. For each set, start with the headline, followed directly by the ad copy, and then the hashtags. Label each section with 'Headline:', 'Ad Copy:', and 'Hashtags:' respectively. Present the sets in sequence (e.g., Set 1, Set 2), rather than grouping all headlines, ad copies, and hashtags separately. Don't provide any introductory text or comments."

const RecommendedAd: React.FC<RecommendedAdProps> = ({ recommendedAd, indexId, videoDetails }) => {
  const [isAdCopyClicked, setIsAdCopyClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { currentPlayerId, setCurrentPlayerId } = usePlayer();

  const { data: rawAdCopyData } = useQuery({
    queryKey: ["adCopy", recommendedAd.id],
    queryFn: () => generateCustomTexts(recommendedAd.id!, AD_COPY_PROMPT),
    enabled: !!recommendedAd.id && isAdCopyClicked,
  });

  const adCopyData = useMemo(() => rawAdCopyData, [rawAdCopyData]);

  const handleGenerateClick = () => {
    setIsGenerating(true);
    setIsAdCopyClicked(true);
  };

  return (
    <div className="w-full">
      <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} />}>
        <div className="flex flex-col w-full items-center">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
            <div className="w-[235px] aspect-video overflow-hidden rounded-lg">
              {currentPlayerId === recommendedAd.id ? (
                <Video
                  videoId={recommendedAd.id ?? ''}
                  indexId={indexId}
                  showTitle={false}
                  videoDetails={videoDetails}
                  playing={true}
                  onPlay={() => {
                    setCurrentPlayerId(recommendedAd.id ?? null);
                  }}
                  onSelect={() => setCurrentPlayerId(recommendedAd.id ?? null)}
                />
              ) : (
                <div
                  className="w-full h-full cursor-pointer"
                  onClick={() => recommendedAd.id && setCurrentPlayerId(recommendedAd.id)}
                >
                  <img
                    src={videoDetails?.hls?.thumbnail_urls?.[0] || '/videoFallback.jpg'}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </Suspense>
          <div className="w-fit">
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                size="sm"
                appearance="primary"
                onClick={handleGenerateClick}
                disabled={isAdCopyClicked || adCopyData}
              >
                <div className="flex items-center">
                  <img
                    src={isAdCopyClicked ? "/chatDisabled.svg" : "/chat.svg"}
                    alt="chat icon"
                    className="w-4 h-4 mr-1"
                  />
                  Generate Ad Copy
                </div>
              </Button>
              {(isAdCopyClicked || isGenerating || adCopyData) && (
                <Button
                  type="button"
                  size="sm"
                  appearance="secondary"
                  onClick={() => setIsDialogOpen(true)}
                >
                  {!adCopyData ? <LoadingSpinner /> : 'View Ad Copy'}
                </Button>
              )}
            </div>
          </div>
          <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} />}>
            <AdCopy
              videoDetails={videoDetails || { metadata: { filename: '', video_title: '' } }}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              setIsGenerating={setIsGenerating}
              adCopyData={adCopyData}
            />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  )
}

export default RecommendedAd
