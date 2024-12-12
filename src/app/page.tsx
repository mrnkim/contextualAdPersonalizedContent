"use client";

import { useState } from 'react';
import Button from './Button';
import ContextualAds from './ContextualAds';
import PersonalizedContent from './PersonalizedContent';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [selectedApp, setSelectedApp] = useState<'contextual' | 'personalized'>('contextual');

  return (
    <main className="flex flex-col min-h-screen p-12">
      <div className="flex gap-4 mb-8 max-w-7xl mx-auto w-full">
        <Button
          onClick={() => setSelectedApp('contextual')}
          appearance={selectedApp === 'contextual' ? 'default' : 'subtle'}
        >
          Contextual Ads
        </Button>
        <Button
          onClick={() => setSelectedApp('personalized')}
          appearance={selectedApp === 'personalized' ? 'default' : 'subtle'}
        >
          Personalized Content
        </Button>
      </div>

      {selectedApp === 'contextual' ? (
          <ContextualAds adsIndexId={adsIndexId || ''} />
        ) : (
          <PersonalizedContent />
        )
      }

    </main>
  );
}
