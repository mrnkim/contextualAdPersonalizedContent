import React, {useState, Suspense} from 'react'
import Video from './Video'
import Clips from './Clips'
import { useQuery } from "@tanstack/react-query"
import { generateCustomTexts } from "@/hooks/apiHooks";
import Button from './Button'
import {
  Dialog,
  DialogContent,
  IconButton,
  DialogTitle
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import LoadingSpinner from './LoadingSpinner';
import { RecommendedAdProps, Clip } from './types';

const AD_COPY_PROMPT = "Based on the ad video, provide the headlines, ad copies, and hashtags. Provide the titles (Headline, Ad Copy, Hashtag) before each. Do not include any introductory text or comments. Start straight away with Headlines."

const RecommendedAd: React.FC<RecommendedAdProps> = ({ recommendedAd, indexId, videoDetails }) => {
  const [isAdCopyClicked, setIsAdCopyClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  const { data: AdCopyData, error: adCopyError} = useQuery({
    queryKey: ["adCopy", recommendedAd.id],
    queryFn: () => generateCustomTexts(recommendedAd.id!, AD_COPY_PROMPT),
    enabled: !!recommendedAd.id && isAdCopyClicked
  });

  function parseAdCopy(adCopyText: string) {
    const suggestions = adCopyText?.split('Headline:').filter(Boolean);
    return suggestions.map(suggestion => {
      try {
        const headlineParts = suggestion?.split('Ad Copy:');
        const headline = headlineParts?.[0] || '';

        const remainingParts = headlineParts?.[1]?.split('Hashtag:') || [];
        const adCopy = remainingParts[0] || '';
        const hashtag = remainingParts[1] || '';

        return {
          headline: headline.trim(),
          adCopy: adCopy.trim(),
          hashtag: hashtag.trim(),
        };
      } catch (error) {
        // Return empty strings if parsing fails
        return {
          headline: '',
          adCopy: '',
          hashtag: '',
        };
      }
    });
  }

  const parsedAdCopy = AdCopyData ? parseAdCopy(AdCopyData) : [];

  const handlePreviousSuggestion = () => {
    setCurrentSuggestionIndex((prevIndex) => (prevIndex - 1 + parsedAdCopy.length) % parsedAdCopy.length);
  };

  const handleNextSuggestion = () => {
    setCurrentSuggestionIndex((prevIndex) => (prevIndex + 1) % parsedAdCopy.length);
  };

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
              <ErrorFallback error={error || adCopyError} />
            }
          >
            <Dialog
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle className="pr-12 flex justify-between items-center">
                <div className="flex-grow text-center">
                  Ad Content Generation for {videoDetails?.metadata.filename}
                </div>
                <IconButton
                  aria-label="close"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                {AdCopyData ? (
                  <div className="p-4">
                    {parsedAdCopy.length > 0 && (
                      <div className="relative px-8">
                        <p className="mb-2"><strong>Headline:</strong></p>
                        <h2 className="mb-4">{parsedAdCopy[currentSuggestionIndex].headline}</h2>
                        <p className="mb-2"><strong>Ad Copy:</strong></p>
                        <p className="mb-4">{parsedAdCopy[currentSuggestionIndex].adCopy}</p>
                        <p className="mb-2"><strong>Hashtags:</strong></p>
                        <p className="text-blue-500">{parsedAdCopy[currentSuggestionIndex].hashtag}</p>
                        {parsedAdCopy.length > 1 && (
                          <>
                            <IconButton
                              onClick={handlePreviousSuggestion}
                              sx={{
                                position: 'absolute',
                                left: -20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                              }}
                            >
                              <ArrowBackIosIcon />
                            </IconButton>
                            <IconButton
                              onClick={handleNextSuggestion}
                              sx={{
                                position: 'absolute',
                                right: -20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                              }}
                            >
                              <ArrowForwardIosIcon />
                            </IconButton>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>}
              </DialogContent>
            </Dialog>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  )
}



export default RecommendedAd
