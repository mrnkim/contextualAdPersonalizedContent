import React, {useState, Suspense} from 'react'
import Video from './Video'
import Clips from './Clips'
import { useQuery } from "@tanstack/react-query"
import { fetchVideoDetails, generateCustomTexts } from "@/hooks/apiHooks";
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

interface RecommendedAdProps {
  recommendedAd: {
    id?: string
    clips: Array<object>
  };
  indexId: string;
}

interface Clip {
  confidence: "low" | "medium" | "high";
  end: number;
  metadata: Array<{ type: string }>;
  modules: Array<{ type: string, confidence: string }>;
  start: number;
  score: number;
  thumbnail_url: string;
  video_id: string;
}

const AD_COPY_PROMPT = "Based on the ad video, provide the headlines, ad copies, and hashtags. Provide the titles (Headline, Ad Copy, Hashtag) before each. Do not include any introductory text or comments. Start straight away with Headlines."


const RecommendedAd: React.FC<RecommendedAdProps> = ({ recommendedAd, indexId }) => {
  const [isAdCopyClicked, setIsAdCopyClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  const { data: videoDetails, error: videoDetailsError } = useQuery({
    queryKey: ["videoDetails", recommendedAd.id],
    queryFn: () => fetchVideoDetails(recommendedAd.id!, indexId),
    enabled: !!recommendedAd.id && !!indexId
  });

  const { data: AdCopyData, error: adCopyError} = useQuery({
    queryKey: ["adCopy", recommendedAd.id],
    queryFn: () => generateCustomTexts(recommendedAd.id!, AD_COPY_PROMPT),
    enabled: !!recommendedAd.id && isAdCopyClicked
  });

  const parsedAdCopy = AdCopyData ? parseAdCopy(AdCopyData) : [];

  const handlePreviousSuggestion = () => {
    setCurrentSuggestionIndex((prevIndex) => (prevIndex - 1 + parsedAdCopy.length) % parsedAdCopy.length);
  };

  const handleNextSuggestion = () => {
    setCurrentSuggestionIndex((prevIndex) => (prevIndex + 1) % parsedAdCopy.length);
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) =>
        <ErrorFallback error={error || videoDetailsError} />
      }
    >
      <div className="flex w-full my-5">
        <div className="w-1/2 pr-2">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
            <Video video={recommendedAd} indexId={indexId}/>
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
              <img src="/chat.svg" alt="chat icon" className="w-4 h-4"className="w-4 h-4" />
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
        <div className="flex justify-center">
        </div>
        <div className="w-1/2 pl-2 overflow-auto">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
            <Clips
              clips={recommendedAd.clips as Clip[]}
              videoDetails={videoDetails}
            />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function parseAdCopy(adCopyText: string) {
  const suggestions = adCopyText.split('Headline:').filter(Boolean);
  return suggestions.map(suggestion => {
    const [headline, rest] = suggestion.split('Ad Copy:');
    const [adCopy, hashtag] = rest.split('Hashtag:');
    return {
      headline: headline.trim(),
      adCopy: adCopy.trim(),
      hashtag: hashtag.trim(),
    };
  });
}

export default RecommendedAd
