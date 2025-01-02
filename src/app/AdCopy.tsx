import React, { Suspense, useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    IconButton,
    DialogTitle
  } from "@mui/material";
  import CloseIcon from '@mui/icons-material/Close';
  import LoadingSpinner from './LoadingSpinner';
  import { ErrorBoundary } from 'react-error-boundary'
  import ErrorFallback from '@/app/ErrorFallback';
  import { AdCopyProps } from '@/app/types';

  const AdCopy = ({ videoDetails, isDialogOpen, setIsDialogOpen, setIsGenerating, adCopyData }: AdCopyProps) => {
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

    useEffect(() => {
      if (adCopyData) {
        setIsGenerating(false);
      }
    }, [adCopyData, setIsGenerating]);

      const handlePreviousSuggestion = () => {
        setCurrentSuggestionIndex((prevIndex: number) => (prevIndex - 1 + parsedAdCopy.length) % parsedAdCopy.length);
      };

      const handleNextSuggestion = () => {
        setCurrentSuggestionIndex((prevIndex: number) => (prevIndex + 1) % parsedAdCopy.length);
      };

      function parseAdCopy(adCopyText: string) {
        try {
          const sets = adCopyText.split(/[Ss]et \d+:?/g).filter(Boolean);

          return sets.map(set => {
            let headline = '';
            let adCopy = '';
            let hashtags = '';

            const parts = set.split(/(?=Headline:|Ad Copy:|Hashtags:)/);

            parts.forEach(part => {
              const trimmedPart = part.trim();
              if (trimmedPart.startsWith('Headline:')) {
                headline = trimmedPart.replace('Headline:', '').trim();
              } else if (trimmedPart.startsWith('Ad Copy:')) {
                adCopy = trimmedPart.replace('Ad Copy:', '').trim();
              } else if (trimmedPart.startsWith('Hashtags:')) {
                hashtags = trimmedPart.replace('Hashtags:', '').trim();
              }
            });

            return {
              headline,
              adCopy,
              hashtag: hashtags
            };
          });
        } catch (error) {
          console.error('Error parsing ad copy:', error);
          return [{
            headline: '',
            adCopy: '',
            hashtag: '',
          }];
        }
      }

    const parsedAdCopy = adCopyData ? parseAdCopy(adCopyData) : [];

  return (
    <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} />}>
        <Suspense fallback={<div className="flex justify-center items-center h-40"><LoadingSpinner /></div>}>
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
      {adCopyData ? (
        <div className="p-4">
          {parsedAdCopy.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousSuggestion}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={parsedAdCopy.length <= 1}
                >
                  <img
                    src={parsedAdCopy.length <= 1 ? "/ChevronLeftDisabled.svg" : "/ChevronLeft.svg"}
                    alt="Previous"
                  />
                </button>
                <div className="flex-1 px-8">
                  <div className="text-center">
                    <span className="text-sm text-gray-500">
                      {currentSuggestionIndex + 1} / {parsedAdCopy.length}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2"><strong>Headline:</strong></p>
                    <h2 className="mb-4">{parsedAdCopy[currentSuggestionIndex].headline}</h2>
                    <p className="mb-2"><strong>Ad Copy:</strong></p>
                    <p className="mb-4">{parsedAdCopy[currentSuggestionIndex].adCopy}</p>
                    <p className="mb-2"><strong>Hashtags:</strong></p>
                    <p className="text-blue-500">{parsedAdCopy[currentSuggestionIndex].hashtag}</p>
                  </div>
                </div>
                <button
                  onClick={handleNextSuggestion}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={parsedAdCopy.length <= 1}
                >
                  <img
                    src={parsedAdCopy.length <= 1 ? "/ChevronRightDisabled.svg" : "/ChevronRight.svg"}
                    alt="Next"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>}
    </DialogContent>
  </Dialog>
  </Suspense>
  </ErrorBoundary>
  )
}

export default AdCopy
