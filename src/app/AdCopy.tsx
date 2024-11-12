import React, { Suspense, useState } from 'react'
import {
    Dialog,
    DialogContent,
    IconButton,
    DialogTitle
  } from "@mui/material";
  import CloseIcon from '@mui/icons-material/Close';
  import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
  import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
  import LoadingSpinner from './LoadingSpinner';
  import { ErrorBoundary } from 'react-error-boundary'
  import ErrorFallback from './ErrorFallback';
  import { useQuery } from "@tanstack/react-query"
  import { generateCustomTexts } from "@/hooks/apiHooks";
  import { AdCopyProps } from './types';
  const AD_COPY_PROMPT = "Based on the ad video, provide the headlines, ad copies, and hashtags. Provide the titles (Headline, Ad Copy, Hashtag) before each. Do not include any introductory text or comments. Start straight away with Headlines."

const AdCopy = ({ recommendedAd, videoDetails, isAdCopyClicked, isDialogOpen, setIsDialogOpen }: AdCopyProps) => {
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);


    const { data: AdCopyData } = useQuery({
        queryKey: ["adCopy", recommendedAd.id],
        queryFn: () => generateCustomTexts(recommendedAd.id!, AD_COPY_PROMPT),
        enabled: !!recommendedAd.id && isAdCopyClicked
      });

      const handlePreviousSuggestion = () => {
        setCurrentSuggestionIndex((prevIndex: number) => (prevIndex - 1 + parsedAdCopy.length) % parsedAdCopy.length);
      };

      const handleNextSuggestion = () => {
        setCurrentSuggestionIndex((prevIndex: number) => (prevIndex + 1) % parsedAdCopy.length);
      };

      function parseAdCopy(adCopyText: string) {
        try {
          // Check if text contains section indicators (Headlines/Ad Copy/Hashtags)
          if (adCopyText.match(/headlines|ad copy|hashtags/i)) {
            // Split by any combination of ### or newlines
            const cleanText = adCopyText.replace(/#{3,}/g, '\n').trim();
            const sections = cleanText.split(/\n+/);

            const headlines: string[] = [];
            const adCopies: string[] = [];
            const hashtags: string[] = [];

            let currentSection: 'headlines' | 'adcopy' | 'hashtags' | null = null;

            sections.forEach(section => {
              const trimmedSection = section.trim();

              // Determine section type
              if (trimmedSection.toLowerCase().includes('headline')) {
                currentSection = 'headlines';
              } else if (trimmedSection.toLowerCase().includes('ad copy')) {
                currentSection = 'adcopy';
              } else if (trimmedSection.toLowerCase().includes('hashtag')) {
                currentSection = 'hashtags';
              } else if (trimmedSection && currentSection) {
                // Process content based on current section
                const items = trimmedSection.split('-').map(item => item.trim()).filter(Boolean);

                switch (currentSection) {
                  case 'headlines':
                    headlines.push(...items);
                    break;
                  case 'adcopy':
                    adCopies.push(...items);
                    break;
                  case 'hashtags':
                    hashtags.push(...items);
                    break;
                }
              }
            });

            // Create combinations of headlines, ad copies, and hashtags
            const maxLength = Math.max(headlines.length, adCopies.length, 1);
            return Array.from({ length: maxLength }, (_, i) => ({
              headline: headlines[i] || headlines[0] || '',
              adCopy: adCopies[i] || adCopies[0] || '',
              hashtag: hashtags.join(' ') || ''
            }));
          }

          // Fallback to original parsing logic for "Headline:" format
          const suggestions = adCopyText.split('Headline:').filter(Boolean);
          return suggestions.map(suggestion => {
            const headlineParts = suggestion.split('Ad Copy:');
            const headline = headlineParts[0] || '';

            const remainingParts = headlineParts[1]?.split('Hashtag:') || [];
            const adCopy = remainingParts[0] || '';
            const hashtag = remainingParts[1] || '';

            return {
              headline: headline.trim(),
              adCopy: adCopy.trim(),
              hashtag: hashtag.trim(),
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

    const parsedAdCopy = AdCopyData ? parseAdCopy(AdCopyData) : [];

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
  </Suspense>
  </ErrorBoundary>
  )
}

export default AdCopy
