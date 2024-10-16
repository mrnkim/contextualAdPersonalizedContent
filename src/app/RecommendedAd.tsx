import React, {useState} from 'react'
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

  const { data: videoDetails} = useQuery({
    queryKey: ["videoDetails", recommendedAd.id],
    queryFn: () => fetchVideoDetails(recommendedAd.id!, indexId),
    enabled: !!recommendedAd.id && !!indexId
  });

  const { data: AdCopyData, error: adCopyError, isLoading: isAdCopyLoading } = useQuery({
    queryKey: ["adCopy", recommendedAd.id],
    queryFn: () => generateCustomTexts(recommendedAd.id, AD_COPY_PROMPT),
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
    <div className="flex w-full my-5">
      <div className="w-1/2 pr-2">
        <Video video={recommendedAd} indexId={indexId}/>
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
            Generate Ad Copy
          </Button>
        </div>
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
           <DialogTitle>
          Ad Content Generation for {videoDetails?.metadata.filename}
        </DialogTitle>
          <DialogContent className="relative">
            <IconButton
              aria-label="close"
              onClick={() => setIsDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            {AdCopyData ? (
              <div className="p-4">
                {parsedAdCopy.length > 0 && (
                  <div className="relative">
                    <p className="mb-2"><strong>Headline:</strong></p>
                    <h2 className="text-xl mb-4">{parsedAdCopy[currentSuggestionIndex].headline}</h2>
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
                            left: -16,
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
                            right: -16,
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
            ) : (
              <p>Loading Ad Copy...</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex justify-center">
      </div>
      <div className="w-1/2 pl-2 overflow-auto">
        <Clips
          clips={recommendedAd.clips as Clip[]}
          videoDetails={videoDetails}
        />
      </div>
    </div>
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
