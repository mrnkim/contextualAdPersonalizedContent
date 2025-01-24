"use client";

import { useState, useEffect } from 'react';
import Button from './components/Button';
import ContextualAds from './components/ContextualAds';
import PersonalizedContent from './components/PersonalizedContent';
import { PlayerProvider } from '@/contexts/PlayerContext';
import Joyride, { Step } from 'react-joyride';
import { ButtonProps } from './types';
import clsx from 'clsx';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;

const AppSelectionButton = ({ className, selected, ...props }: ButtonProps & { selected?: boolean }) => (
  <Button
    className={clsx(
      'transition-colors duration-200',
      'border border-grey-200',
      'flex items-center gap-2',
      selected
        ? 'bg-gray-200 text-gray-900 font-medium !important'
        : 'bg-white text-gray-600 hover:bg-gray-100 !important',
      className
    )}
    appearance="default"
    {...props}
  />
);

export default function Page() {
  const [selectedApp, setSelectedApp] = useState<'contextual' | 'personalized'>('contextual');
  const [selectedIndexId, setSelectedIndexId] = useState<string>(process.env.NEXT_PUBLIC_ADS_INDEX_ID || '');
  const [hasProcessedAds, setHasProcessedAds] = useState(false);
  const [hasProcessedFootage, setHasProcessedFootage] = useState(false);
  const [useEmbeddings, setUseEmbeddings] = useState(false);
  const [runTour, setRunTour] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [profiles, setProfiles] = useState([
      {
        profilePic: '/profile1.jpg',
        interests: ['Jazz', 'Travel', 'Beauty'],
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
        interests: ['Sports', 'Books', 'Food'],
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


  const steps: Step[] = [
    {
      target: '.contextual-ads-btn',
      content: 'Explore video-based contextual ad matching',
      placement: 'bottom',
    },
    {
      target: '.personalized-content-btn',
      content: 'Switch to personalized content recommendations',
      placement: 'bottom',
    },
    {
      target: '.embeddings-toggle',
      content: 'Enable embedding-based search across both apps',
      placement: 'bottom',
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
              arrowColor: '#fff',
              backgroundColor: '#fff',
            },
            buttonNext: {
              color: '#444444',
              fontWeight: 'normal',
              fontSize: '14px'
            },
            buttonBack: {
              color: '#444444',
              fontWeight: 'normal',
              fontSize: '14px'
            },
            buttonSkip: {
              color: '#444444',
              fontWeight: 'normal',
              fontSize: '14px'
            },
            tooltip: {
              textAlign: 'left',
              backgroundColor: '#fff',
              fontSize: '14px'
            },
            tooltipContainer: {
              textAlign: 'left'
            },
            tooltipContent: {
              textAlign: 'left',
              padding: '20px',
              fontSize: '14px'
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
          <div className="flex">
            <AppSelectionButton
              onClick={() => setSelectedApp('contextual')}
              selected={selectedApp === 'contextual'}
              className="contextual-ads-btn rounded-r-none border-r-0"
            >
              <img src="/media.svg" alt="Contextual Ads icon" className="w-4 h-4" />
              Contextual Ads
            </AppSelectionButton>
            <AppSelectionButton
              onClick={() => setSelectedApp('personalized')}
              selected={selectedApp === 'personalized'}
              className="personalized-content-btn rounded-l-none"
            >
              <img src="/focus.svg" alt="Personalized Content icon" className="w-4 h-4" />
              Personalized Content
            </AppSelectionButton>
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
