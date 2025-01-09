"use client";

import { useState } from 'react';
import Button from './Button';
import ContextualAds from './ContextualAds';
import PersonalizedContent from './PersonalizedContent';
import { PlayerProvider } from '@/contexts/PlayerContext';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [selectedApp, setSelectedApp] = useState<'contextual' | 'personalized'>('contextual');
  const [selectedIndexId, setSelectedIndexId] = useState<string>(process.env.NEXT_PUBLIC_ADS_INDEX_ID || '');
  const [hasProcessedAds, setHasProcessedAds] = useState(false);
  console.log("🚀 > Page > hasProcessedAds=", hasProcessedAds)
  const [hasProcessedFootage, setHasProcessedFootage] = useState(false);
  console.log("🚀 > Page > hasProcessedFootage=", hasProcessedFootage)
  const [useEmbeddings, setUseEmbeddings] = useState(false);
  console.log("🚀 > Page > useEmbeddings=", useEmbeddings)
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
        <div className="flex justify-between max-w-7xl mx-auto w-full mb-8">
          <div className="flex gap-4">
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
          <div className="flex items-center gap-2">
            <span className="text-sm">Use Embeddings</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useEmbeddings}
                onChange={(e) => setUseEmbeddings(e.target.checked)}
              />
              <div className="w-11 h-6 bg-green-600 peer-focus:outline-none peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {selectedApp === 'contextual' ? (
          <ContextualAds
            adsIndexId={adsIndexId || ''}
            profiles={profiles}
            setProfiles={setProfiles}
            hasProcessedAds={hasProcessedAds}
            setHasProcessedAds={setHasProcessedAds}
            hasProcessedFootage={hasProcessedFootage}
            setHasProcessedFootage={setHasProcessedFootage}
            useEmbeddings={useEmbeddings}
          />
        ) : (
          <PersonalizedContent
            profiles={profiles}
            setProfiles={setProfiles}
            selectedIndexId={selectedIndexId}
            setSelectedIndexId={setSelectedIndexId}
            useEmbeddings={useEmbeddings}
          />
        )}
      </main>
    </PlayerProvider>
  );
}
