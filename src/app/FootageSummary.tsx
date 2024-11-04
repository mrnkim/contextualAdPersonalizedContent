import React, { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { FootageSummaryProps } from './types';
import {
  Dialog,
  DialogContent,
  IconButton,
  DialogTitle
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

function FootageSummary({
  hashtags,
  setHashtags,
  gistData,
  customTextsData,
  isLoading,
  error,
  setShowAnalysis
}: FootageSummaryProps) {

  useEffect(() => {
    if (gistData?.hashtags) {
      setHashtags(gistData.hashtags);
    }
  }, [gistData]);

  const formatCustomTexts = (data: string) => {
    const sections = ["Event Type", "Main Content", "Emotional Tone"];
    return sections.map((section, index) => {
      const regex = new RegExp(`${section}:\\s*(.+?)(?=\\n(?:Event Type|Main Content|Emotional Tone):|$)`, 's');
      const match = data.match(regex);
      const content = match ? match[1]?.trim() : '';
      return (
        <div key={index} className="mb-6">
          <h3 className="font-bold text-lg mb-2">{section}</h3>
          <p>{content}</p>
        </div>
      );
    });
  };

  const renderGistData = () => {
    if (!gistData) return null;
    return (
      <>
        <div className="mb-5">
          {gistData?.hashtags?.map((tag: string) => `#${tag?.trim()}`).join(' ')}
        </div>
      </>
    );
  };

  const renderHashtags = () => {
    if (hashtags.length > 0) {
      return <div className="mb-5">{hashtags.map((tag: string) => `#${tag?.trim()}`).join(' ')}</div>;
    }
  };

  const renderCustomTexts = () => {
    if (!customTextsData) return null;
    return (
      <div className="mb-2">
        {formatCustomTexts(customTextsData as string)}
      </div>
    );
  };

  return (
    <Dialog
      open={true}
      onClose={() => setShowAnalysis(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <span>News Footage Analysis</span>
          <IconButton
            onClick={() => setShowAnalysis(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {hashtags.length > 0 ? renderHashtags() : renderGistData()}
              {renderCustomTexts()}
            </>
          )}
          {error && <ErrorFallback error={error} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FootageSummary;
