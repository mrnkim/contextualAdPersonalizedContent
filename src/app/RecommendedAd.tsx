import React, {useState, Suspense} from 'react'
import Video from './Video'
import Button from './Button'
import AdCopy from './AdCopy';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import LoadingSpinner from './LoadingSpinner';
import { RecommendedAdProps } from './types';


const RecommendedAd: React.FC<RecommendedAdProps> = ({ recommendedAd, indexId, videoDetails }) => {
  const [isAdCopyClicked, setIsAdCopyClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = () => {
    setIsGenerating(true);
    setIsAdCopyClicked(true);
  };

  return (
    <div className="w-full">
      <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} />}>
        <div className="flex flex-col w-full items-center">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
            <Video videoId={recommendedAd.id ?? ''} indexId={indexId} showTitle={false} videoDetails={videoDetails}/>
          </Suspense>
          <div className="w-fit">
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                size="sm"
                appearance="primary"
                onClick={handleGenerateClick}
                disabled={isAdCopyClicked}
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
              {(isAdCopyClicked || isGenerating) && (
                <Button
                  type="button"
                  size="sm"
                  appearance="secondary"
                  onClick={() => setIsDialogOpen(true)}
                >
                  {isGenerating ? <LoadingSpinner /> : 'View Ad Copy'}
                </Button>
              )}
            </div>
          </div>
          <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} />}>
            <AdCopy
              recommendedAd={recommendedAd}
              videoDetails={videoDetails}
              isAdCopyClicked={isAdCopyClicked}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              setIsGenerating={setIsGenerating}
            />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  )
}



export default RecommendedAd
