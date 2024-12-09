"use client";

import { useState } from 'react';
import Button from './Button';
import ContextualAds from './ContextualAds';
import UserProfiles from './UserProfiles';
import PersonalizedContent from './PersonalizedContent';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [selectedApp, setSelectedApp] = useState<'contextual' | 'personalized'>('contextual');

  return (
    <main className="flex flex-col min-h-screen p-12">
      <div className="flex gap-4 mb-8 max-w-7xl mx-auto w-full">
        <Button
          onClick={() => setSelectedApp('contextual')}
          className={`${
            selectedApp === 'contextual'
              ? 'text-black'
              : 'text-gray-300'
          }`}
        >
          Contextual Ads
        </Button>
        <Button
          onClick={() => setSelectedApp('personalized')}
          className={`${
            selectedApp === 'personalized'
            ? 'text-black'
            : 'text-gray-300'
          }`}
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
