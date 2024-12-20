"use client";

import { useState } from 'react';
import Button from './Button';
import ContextualAds from './ContextualAds';
import PersonalizedContent from './PersonalizedContent';
import { PlayerProvider } from '@/contexts/PlayerContext';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [selectedApp, setSelectedApp] = useState<'contextual' | 'personalized'>('contextual');
  const [profiles, setProfiles] = useState([
      {
        profilePic: '/profile1.jpg',
        interests: ['Music', 'Travel', 'Beauty'],
        demographics: {
          name: 'Emily',
          age: 19,
          location: 'Los Angeles'
        },
        emotionAffinities: ['Happy', 'Excited', 'Calm'],
        userId: 'user1'
      },
      {
        profilePic: '/profile2.jpg',
        interests: ['Sports', 'Reading', 'Cooking'],
        demographics: {
          name: 'David',
          age: 37,
          location: 'London'
        },
        emotionAffinities: ['Energetic', 'Focused', 'Relaxed'],
        userId: 'user2'
      },
      {
        profilePic: '/profile3.jpg',
        interests: ['Art', 'Fashion', 'Movies'],
        demographics: {
          name: 'Charlotte',
          age: 28,
          location: 'Paris'
        },
        emotionAffinities: ['Creative', 'Inspired', 'Peaceful'],
        userId: 'user3'
      }
    ]);

  return (
    <PlayerProvider>
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
          <ContextualAds adsIndexId={adsIndexId || ''} profiles={profiles} setProfiles={setProfiles} />
        ) : (
          <PersonalizedContent profiles={profiles} setProfiles={setProfiles} />
        )}

      </main>
    </PlayerProvider>
  );
}
