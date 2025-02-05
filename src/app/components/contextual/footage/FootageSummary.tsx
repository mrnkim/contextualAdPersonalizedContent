import React, { useEffect } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorFallback from '../../common/ErrorFallback';
import { FootageSummaryProps } from '@/app/types';
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

  const renderGistData = () => {
    if (!gistData) return null;

    if (typeof gistData === 'string') {
      const tags = gistData.split(/\s+/).filter(tag => tag.startsWith('#'));
      return (
        <div className="mb-5">
          {tags.join(' ')}
        </div>
      );
    }

    return null;
  };

  const renderHashtags = () => {
    if (hashtags && hashtags.length > 0) {
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

  const formatCustomTexts = (data: string) => {
    const sections = ["Event Type", "Main Content", "Emotional Tone"];
    const sectionPattern = sections.join('|');
    const sectionRegex = new RegExp(`(?:\\*{0,2})(${sectionPattern})(?:\\*{0,2})\\s*:?\\s*([\\s\\S]*?)(?=(?:\\*{0,2})(?:${sectionPattern})|$)`, 'gi');
    const sectionContents: { [key: string]: string } = {};

    let match;
    while ((match = sectionRegex.exec(data)) !== null) {
      const sectionName = match[1].trim();
      const content = match[2].trim()
        .replace(/^:\s*/, '')
        .replace(/^\*\*/, '')
        .replace(/\*\*$/, '');
      sectionContents[sectionName] = content;
    }

    return sections.map((section, index) => (
      <div key={index} className="mb-6">
        <h3 className="font-bold text-lg mb-2">{section}</h3>
        <p className="whitespace-pre-wrap">{sectionContents[section] || ''}</p>
      </div>
    ));
  };

  useEffect(() => {
    if (gistData && typeof gistData === 'string') {
      const extractedHashtags = gistData.split(/\s+/).filter(tag => tag.startsWith('#')).map(tag => tag.slice(1));
      setHashtags(extractedHashtags);
    }
  }, [gistData, setHashtags]);

  return (
    <Dialog
      open={true}
      onClose={() => setShowAnalysis(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <div className="flex-1" />
          <span className="flex-1 text-center">Source Footage Analysis</span>
          <div className="flex-1 flex justify-end">
            <IconButton
              onClick={() => setShowAnalysis(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </div>
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
              {renderHashtags() || renderGistData()}
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
