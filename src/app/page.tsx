"use client";

import { useState, useEffect } from 'react';
import Button from './Button';
import ContextualAds from './ContextualAds';
import PersonalizedContent from './PersonalizedContent';
import { PlayerProvider } from '@/contexts/PlayerContext';
import Joyride, { Step } from 'react-joyride';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

export default function Page() {
  const [selectedApp, setSelectedApp] = useState<'contextual' | 'personalized'>('contextual');
  const [selectedIndexId, setSelectedIndexId] = useState<string>(process.env.NEXT_PUBLIC_ADS_INDEX_ID || '');
  const [hasProcessedAds, setHasProcessedAds] = useState(false);
  const [hasProcessedFootage, setHasProcessedFootage] = useState(false);
  const [useEmbeddings, setUseEmbeddings] = useState(false);
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
  const [runTour, setRunTour] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const steps: Step[] = [
    {
      target: '.contextual-ads-btn',
      content: 'Click here to explore contextual ad matching based on video content analysis',
      placement: 'bottom',
    },
    {
      target: '.personalized-content-btn',
      content: 'Switch to personalized content recommendations based on user profiles and preferences',
      placement: 'bottom',
    },
    {
      target: '.embeddings-toggle',
      content: 'Toggle this button to enable embedding-based search for more precise results across both apps',
      placement: 'bottom',
    },
  ];

  return (
    <PlayerProvider>
      {isMounted && (
        <Joyride
          steps={steps}
          run={runTour}
          continuous={true}
          showSkipButton={true}
          styles={{
            options: {
              primaryColor: '#9AED59',
            },
            buttonNext: {
              color: '#444444',
              fontWeight: 'normal'
            },
            buttonBack: {
              color: '#444444',
              fontWeight: 'normal'
            }
          }}
          callback={(data) => {
            const { status } = data;
            if (status === 'finished' || status === 'skipped') {
              setRunTour(false);
            }
          }}
        />
      )}

      <main className="flex flex-col min-h-screen p-12">
        <div className="flex justify-between max-w-7xl mx-auto w-full mb-8">
          <div className="flex gap-4">
            <Button
              onClick={() => setSelectedApp('contextual')}
              appearance={selectedApp === 'contextual' ? 'default' : 'subtle'}
              className="contextual-ads-btn"
            >
              Contextual Ads
            </Button>
            <Button
              onClick={() => setSelectedApp('personalized')}
              appearance={selectedApp === 'personalized' ? 'default' : 'subtle'}
              className="personalized-content-btn"
            >
              Personalized Content
            </Button>
          </div>
          <div className="flex items-center gap-2 embeddings-toggle">
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
            hasProcessedAds={hasProcessedAds}
            setHasProcessedAds={setHasProcessedAds}
            useEmbeddings={useEmbeddings}
          />
        )}
      </main>
    </PlayerProvider>
  );
}
