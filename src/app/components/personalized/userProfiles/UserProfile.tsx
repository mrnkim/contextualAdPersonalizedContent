import React, { useEffect, useState } from 'react'
import Button from '../../common/Button';
import { useQueries } from "@tanstack/react-query";
import { fetchSearchPage, textToVideoSearch } from '@/hooks/apiHooks';
import { UserProfileProps, VideoItem } from '@/app/types';
import ProfilePicture from './ProfilePicture';
import InterestsSection from './InterestsSection';
import DemographicsSection from './DemographicsSection';
import EmotionAffinitiesSection from './EmotionAffinitiesSection';
import SearchResults from './SearchResults';


function UserProfile({
  profilePic = '/default-profile.png',
  interests: initialInterests = [],
  demographics: initialDemographics = {
    name: '',
    age: 0,
    location: '',
  },
  emotionAffinities: initialEmotionAffinities = [],
  userId,
  indexId,
  onUpdateProfile,
  useEmbeddings,
  processingAdsInPersonalizedContent
}: UserProfileProps) {
  // Core state
  const interests = initialInterests;
  const demographics = initialDemographics;
  const emotionAffinities = initialEmotionAffinities;

  // UI State
  const [isSearchClicked, setIsSearchClicked] = useState(false);

  // Search queries setup
  const searchQueries = useQueries({
    queries: interests.map((interest) => ({
      queryKey: ["search", interest, userId, isSearchClicked, indexId, useEmbeddings],
      queryFn: async () => {
        if (!isSearchClicked) return null;
        try {
          const results = [];

          if (useEmbeddings) {
            const response = await fetch('/api/keywordEmbeddingSearch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ searchTerm: interest, indexId })
            });
            const data = await response.json();
            return {
              data: data.map((item: { metadata: { tl_video_id: string }, score: number }) => ({
                id: item.metadata.tl_video_id,
                clips: [{ score: item.score }]
              })),
              searchTerm: interest
            };
          }

          // Original keyword-based search
          const initialResponse = await textToVideoSearch(indexId, interest, ["visual", "audio"], 10, 0.6);
          results.push(...(initialResponse.data || []));

          let currentPageToken = initialResponse.page_info?.next_page_token;
          while (currentPageToken) {
            const nextPage = await fetchSearchPage(currentPageToken);
            results.push(...(nextPage.data || []));
            currentPageToken = nextPage.page_info?.next_page_token;
          }

          return { data: results, searchTerm: interest };
        } catch (error) {
          console.error(`Search error for "${interest}":`, error);
          return { data: [], searchTerm: interest };
        }
      },
      enabled: isSearchClicked,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
    })),
  });

  const isLoading = searchQueries.some(query => query.isLoading);

  const allSearchResults = React.useMemo(() => {
    const results = new Map();

    searchQueries
    .filter(query => query.data?.data && query.isSuccess)
    .forEach(query => {
      if (interests.includes(query.data!.searchTerm)) {
        query.data!.data.forEach((item: VideoItem) => {
          if (!results.has(item.id)) {
            results.set(item.id, item);
          }
        });
      }
    });

    return Array.from(results.values());
  }, [searchQueries, interests]);

  // Effects
  useEffect(() => {
    setIsSearchClicked(false);
  }, [interests, demographics, emotionAffinities, indexId, useEmbeddings]);

  const profileData = {
    profilePic,
    userId,
    interests,
    demographics,
    emotionAffinities
  };

  return (
    <div className="flex flex-col items-center w-[360px]">
      <div className="border border-grey-500 rounded-none p-4 w-full space-y-4">
        <ProfilePicture profilePic={profilePic} />

        <InterestsSection
          interests={interests}
          onUpdateProfile={onUpdateProfile}
          profileData={profileData}
          setIsSearchClicked={setIsSearchClicked}
        />

        <DemographicsSection
          demographics={demographics}
          onUpdateProfile={onUpdateProfile}
          profileData={profileData}
          setIsSearchClicked={setIsSearchClicked}
        />

        <EmotionAffinitiesSection
          emotionAffinities={emotionAffinities}
          onUpdateProfile={onUpdateProfile}
          profileData={profileData}
          setIsSearchClicked={setIsSearchClicked}
        />

        <div className="flex justify-center pt-6">
          <Button
            type="button"
            size="sm"
            appearance="primary"
            onClick={() => {
              setIsSearchClicked(true);
            }}
            disabled={isLoading || (useEmbeddings && processingAdsInPersonalizedContent) || isSearchClicked || interests.length === 0}
            >
              <img
                src={isLoading || (useEmbeddings && processingAdsInPersonalizedContent) || isSearchClicked || interests.length === 0 ? "/magicDisabled.svg" : "/magic.svg"}
                alt="Magic wand icon"
                className="w-4 h-4"
              />
              <div className="flex items-center">
                {useEmbeddings ? "Recommend by Embeddings" : "Recommend"}
              </div>
          </Button>
        </div>

        {isSearchClicked && (
          <SearchResults
            isLoading={isLoading}
            searchResults={allSearchResults}
            demographics={demographics}
            userId={userId}
            indexId={indexId}
          />
        )}
      </div>
    </div>
  );
}

export default UserProfile