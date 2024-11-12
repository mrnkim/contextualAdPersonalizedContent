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


  return (
    <div className="w-full">
      <ErrorBoundary
        FallbackComponent={({ error }) =>
          <ErrorFallback error={error} />
        }
      >
        <div className="flex flex-col w-full items-center">
              <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
                <Video videoId={recommendedAd.id} indexId={indexId} showTitle={false}/>
              </Suspense>
          <div className="flex justify-center mt-4">
            <Button
              type="button"
              size="sm"
              appearance="primary"
              onClick={() => {
                setIsAdCopyClicked(true);
                setIsDialogOpen(true);
              }}
            >
              <img src="/chat.svg" alt="chat icon" className="w-4 h-4" />
              Generate Ad Copy
            </Button>
          </div>
          <ErrorBoundary
            FallbackComponent={({ error }) =>
              <ErrorFallback error={error} />
            }
          >
            <AdCopy
              recommendedAd={recommendedAd}
              videoDetails={videoDetails}
              isAdCopyClicked={isAdCopyClicked}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
            />

          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  )
}



export default RecommendedAd
