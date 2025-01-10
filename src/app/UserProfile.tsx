import React from 'react'
import Button from './Button'
import { useQueries } from "@tanstack/react-query";
import { fetchSearchPage, textToVideoSearch } from '@/hooks/apiHooks';
import LoadingSpinner from './LoadingSpinner';
import Video from './Video';
import { Clip, Profile } from '@/app/types';
import { usePlayer } from '@/contexts/PlayerContext';

interface UserProfileProps extends Profile {
  indexId: string;
  onUpdateProfile: (updatedProfile: Partial<Profile>) => void;
  useEmbeddings: boolean;
  processingAdsInPersonalizedContent: boolean;
}

interface VideoItem {
  id: string;
  clips: Clip[];
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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
  const [newInterest, setNewInterest] = React.useState('');
  const [isSearchClicked, setIsSearchClicked] = React.useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const [newDemographicKey, setNewDemographicKey] = React.useState('');
  const [newDemographicValue, setNewDemographicValue] = React.useState('');
  const [nameInput, setNameInput] = React.useState('');
  const [ageInput, setAgeInput] = React.useState('');
  const [locationInput, setLocationInput] = React.useState('');
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [newKeyInput, setNewKeyInput] = React.useState('');
  const [newValueInput, setNewValueInput] = React.useState('');
  const [newEmotion, setNewEmotion] = React.useState('');
  const [showAddField, setShowAddField] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);


  const interests = initialInterests;
  const demographics = initialDemographics;
  const emotionAffinities = initialEmotionAffinities;

  const { currentPlayerId, setCurrentPlayerId } = usePlayer();

  React.useEffect(() => {
    setIsSearchClicked(false);
  }, [interests, demographics, emotionAffinities, indexId]);

  React.useEffect(() => {
    setIsSearchClicked(false);
  }, [useEmbeddings]);

  const handleInterestSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setIsSearchClicked(false);
      onUpdateProfile({
        ...demographics,
        profilePic,
        userId,
        interests: [...interests, newInterest.trim()],
        demographics,
        emotionAffinities
      });
      setNewInterest('');
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setIsSearchClicked(false);
    onUpdateProfile({
      ...demographics,
      profilePic,
      userId,
      interests: interests.filter((_, index) => index !== indexToRemove),
      demographics,
      emotionAffinities
    });
  };

  const removeDemographic = (key: string) => {
    setIsSearchClicked(false);
    const newDemographics = { ...demographics };
    delete newDemographics[key];
    onUpdateProfile({
      ...demographics,
      profilePic,
      userId,
      interests,
      demographics: newDemographics,
      emotionAffinities
    });
  };

  const handleEmotionSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newEmotion.trim()) {
      setIsSearchClicked(false);
      onUpdateProfile({
        ...demographics,
        profilePic,
        userId,
        interests,
        demographics,
        emotionAffinities: [...emotionAffinities, newEmotion.trim()]
      });
      setNewEmotion('');
    }
  };

  const removeEmotion = (indexToRemove: number) => {
    setIsSearchClicked(false);
    onUpdateProfile({
      ...demographics,
      profilePic,
      userId,
      interests,
      demographics,
      emotionAffinities: emotionAffinities.filter((_, index) => index !== indexToRemove)
    });
  };

  const searchQueries = useQueries({
    queries: interests.map((interest) => ({
      queryKey: ["search", interest, userId, isSearchClicked, indexId, useEmbeddings],
      queryFn: async () => {
        if (!isSearchClicked) return null;
        try {
          const results = [];

          if (useEmbeddings) {
            // Embedding-based search using the new API
            const response = await fetch('/api/keywordEmbeddingSearch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                searchTerm: interest,
              })
            });
            const data = await response.json();

            // Transform embedding search results to match expected format
            results.push(...data.map((item: { metadata: { tl_video_id: string }, score: number }) => ({
              id: item.metadata.tl_video_id,
              clips: [{
                score: item.score
              }]
            })));
          } else {
            // Original keyword-based search
            const initialResponse = await textToVideoSearch(indexId, interest, [
              "visual",
              "audio",
            ], 10);

            results.push(...(initialResponse.data || []));
            let currentPageToken = initialResponse.page_info?.next_page_token;

            while (currentPageToken) {
              const nextPage = await fetchSearchPage(currentPageToken);
              results.push(...(nextPage.data || []));
              currentPageToken = nextPage.page_info?.next_page_token;
            }
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

  console.log("🚀 > allSearchResults > allSearchResults=", allSearchResults)
  const validCurrentVideoIndex = currentVideoIndex < allSearchResults.length ? currentVideoIndex : 0;

  return (
    <div className="flex flex-col items-center w-[360px]">
      <div className="border rounded-lg p-4 w-full space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden">
            <img
              src={profilePic}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-2 h-[90px]">
          <h3 className="font-semibold">Interests</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="bg-moss_green-200 px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {capitalize(interest)}
                <button
                  onClick={() => removeInterest(index)}
                  className="ml-1 text-grey-500 hover:text-grey-700"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={handleInterestSubmit}
              placeholder="Add interest..."
              className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-24"
              hidden={interests.length === 5}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Demographics</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm">Name:</span>
              {demographics.name ? (
                <span className="bg-moss_green-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {capitalize(demographics.name)}
                  <button
                    onClick={() => removeDemographic('name')}
                    className="ml-1 text-grey-500 hover:text-grey-700"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nameInput.trim()) {
                      onUpdateProfile({
                        ...demographics,
                        profilePic,
                        userId,
                        interests,
                        demographics: {
                          ...demographics,
                          name: nameInput.trim()
                        },
                        emotionAffinities
                      });
                      setNameInput('');
                    }
                  }}
                  placeholder="Enter name..."
                  className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-20 text-sm">Age:</span>
              {demographics.age ? (
                <span className="bg-moss_green-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {capitalize(demographics.age.toString())}
                  <button
                    onClick={() => removeDemographic('age')}
                    className="ml-1 text-grey-500 hover:text-grey-700"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && ageInput.trim()) {
                      onUpdateProfile({
                        ...demographics,
                        profilePic,
                        userId,
                        interests,
                        demographics: {
                          ...demographics,
                          age: parseInt(ageInput.trim())
                        },
                        emotionAffinities
                      });
                      setAgeInput('');
                    }
                  }}
                  placeholder="Enter age..."
                  className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-20 text-sm">Location:</span>
              {demographics.location ? (
                <span className="bg-moss_green-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {capitalize(demographics.location)}
                  <button
                    onClick={() => removeDemographic('location')}
                    className="ml-1 text-grey-500 hover:text-grey-700"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && locationInput.trim()) {
                      onUpdateProfile({
                        ...demographics,
                        profilePic,
                        userId,
                        interests,
                        demographics: {
                          ...demographics,
                          location: locationInput.trim()
                        },
                        emotionAffinities
                      });
                      setLocationInput('');
                    }
                  }}
                  placeholder="Enter location..."
                  className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
                />
              )}
            </div>

            {Object.entries(demographics)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value]) => {
                if (!['name', 'age', 'location'].includes(key)) {
                  return (
                    <div key={key} className="flex items-center">
                      <div className="flex items-center gap-1">
                        {editingKey === key ? (
                          <input
                            type="text"
                            value={newKeyInput}
                            onChange={(e) => setNewKeyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newKeyInput.trim()) {
                                const newDemographics = { ...demographics };
                                delete newDemographics[key];
                                newDemographics[newKeyInput.trim()] = value;
                                onUpdateProfile({
                                  ...demographics,
                                  profilePic,
                                  userId,
                                  interests,
                                  demographics: newDemographics,
                                  emotionAffinities
                                });
                                setEditingKey(null);
                                setNewKeyInput('');
                              }
                            }}
                            onBlur={() => {
                              setEditingKey(null);
                              setNewKeyInput('');
                            }}
                            className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-24"
                            autoFocus
                          />
                        ) : (
                          <>
                            <span
                              className="bg-moss_green-200 px-2 py-1 rounded text-sm cursor-pointer flex items-center"
                              onClick={() => {
                                setEditingKey(key);
                                setNewKeyInput(key);
                              }}
                            >
                              {capitalize(key)}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDemographic(key);
                                }}
                                className="ml-1 text-grey-500 hover:text-grey-700"
                              >
                                ×
                              </button>
                            </span>
                            <span>:</span>
                          </>
                        )}
                      </div>

                      <div className="ml-2">
                        {editingValue === key ? (
                          <input
                            type="text"
                            value={newValueInput}
                            onChange={(e) => setNewValueInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newValueInput.trim()) {
                                onUpdateProfile({
                                  ...demographics,
                                  profilePic,
                                  userId,
                                  interests,
                                  demographics: {
                                    ...demographics,
                                    [key]: newValueInput.trim()
                                  },
                                  emotionAffinities
                                });
                                setEditingValue(null);
                                setNewValueInput('');
                              }
                            }}
                            onBlur={() => {
                              setEditingValue(null);
                              setNewValueInput('');
                            }}
                            className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="bg-moss_green-200 px-2 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                            onClick={() => {
                              setEditingValue(key);
                              setNewValueInput(value as string);
                            }}
                          >
                            {typeof value === 'string' ? capitalize(value) : value}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateProfile({
                                  ...demographics,
                                  profilePic,
                                  userId,
                                  interests,
                                  demographics: {
                                    ...demographics,
                                    [key]: ''
                                  },
                                  emotionAffinities
                                });
                              }}
                              className="ml-1 text-grey-500 hover:text-grey-700"
                            >
                              ×
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}

            {showAddField ? (
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <input
                    type="text"
                    value={newDemographicKey}
                    onChange={(e) => setNewDemographicKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDemographicValue.trim()) {
                        e.preventDefault();
                        const trimmedKey = newDemographicKey.trim();
                        const trimmedValue = newDemographicValue.trim();
                        if (trimmedKey && trimmedValue) {
                          onUpdateProfile({
                            ...demographics,
                            profilePic,
                            userId,
                            interests,
                            demographics: {
                              ...demographics,
                              [trimmedKey]: trimmedValue
                            },
                            emotionAffinities
                          });
                          setNewDemographicKey('');
                          setNewDemographicValue('');
                          setShowAddField(false);
                        }
                      }
                    }}
                    placeholder="Add field"
                    className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-24"
                  />
                  <span className="mx-1">:</span>
                </div>

                <input
                  type="text"
                  value={newDemographicValue}
                  onChange={(e) => setNewDemographicValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newDemographicKey.trim()) {
                      e.preventDefault();
                      const trimmedKey = newDemographicKey.trim();
                      const trimmedValue = newDemographicValue.trim();
                      if (trimmedKey && trimmedValue) {
                        onUpdateProfile({
                          ...demographics,
                          profilePic,
                          userId,
                          interests,
                          demographics: {
                            ...demographics,
                            [trimmedKey]: trimmedValue
                          },
                          emotionAffinities
                        });
                        setNewDemographicKey('');
                        setNewDemographicValue('');
                        setShowAddField(false);
                      }
                    }
                  }}
                  placeholder="Add value"
                  className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
                />
              </div>
            ) : (
              <div className="flex justify-start">
                <button
                  onClick={() => setShowAddField(true)}
                  className="text-sm text-grey-500 hover:text-grey-700"
                >
                  + Add more
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 h-[90px]">
          <h3 className="font-semibold">Emotion Affinities</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {emotionAffinities.map((emotion, index) => (
              <span
                key={index}
                className="bg-moss_green-200 px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {capitalize(emotion)}
                <button
                  onClick={() => removeEmotion(index)}
                  className="ml-1 text-grey-500 hover:text-grey-700"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={newEmotion}
              onChange={(e) => setNewEmotion(e.target.value)}
              onKeyDown={handleEmotionSubmit}
              placeholder="Add emotion"
              className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-32"
              hidden={emotionAffinities.length === 5}
            />
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Button
            type="button"
            size="sm"
            appearance="primary"
            onClick={() => {
              setIsSearchClicked(true);
            }}
            disabled={useEmbeddings && processingAdsInPersonalizedContent}
          >
            <div className="flex items-center">
              {useEmbeddings ? "Search by Embeddings" : "Search"}
            </div>
          </Button>
        </div>

        {isSearchClicked && (
          <div className="w-full">
            <h3 className="font-semibold mb-2 mt-8">
              Search Results for {demographics.name}
              {useEmbeddings ? " (Using Embeddings)" : " (Using profile Keywords)"}
            </h3>
            {isLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            ) : allSearchResults.length > 0 ? (
              <div className="space-y-2">
                <div className="p-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setCurrentVideoIndex(prev =>
                        prev === 0 ? allSearchResults.length - 1 : prev - 1
                      );
                      if (isPlaying) {
                        const newIndex = currentVideoIndex === 0 ? allSearchResults.length - 1 : currentVideoIndex - 1;
                        setCurrentPlayerId(`searchResult-${userId}-${allSearchResults[newIndex]?.id}`);
                      }
                    }}
                    className="p-1 flex-shrink-0"
                    disabled={allSearchResults.length === 1}
                  >
                    <svg
                      className={`w-5 h-5 ${allSearchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-[240px] h-[135px]">
                    <Video
                      videoId={allSearchResults[validCurrentVideoIndex]?.id}
                      indexId={indexId}
                      showTitle={false}
                      playing={currentPlayerId === `searchResult-${userId}-${allSearchResults[validCurrentVideoIndex]?.id}`}
                      onPlay={() => {
                        setCurrentPlayerId(`searchResult-${userId}-${allSearchResults[validCurrentVideoIndex]?.id}`);
                        setIsPlaying(true);
                      }}
                      onPause={() => {
                        setIsPlaying(false);
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setCurrentVideoIndex(prev =>
                        prev === allSearchResults.length - 1 ? 0 : prev + 1
                      );
                      if (isPlaying) {
                        const newIndex = currentVideoIndex === allSearchResults.length - 1 ? 0 : currentVideoIndex + 1;
                        setCurrentPlayerId(`searchResult-${userId}-${allSearchResults[newIndex]?.id}`);
                      }
                    }}
                    className="p-1 flex-shrink-0"
                    disabled={allSearchResults.length === 1}
                  >
                    <svg
                      className={`w-5 h-5 ${allSearchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-grey-500">No results found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile