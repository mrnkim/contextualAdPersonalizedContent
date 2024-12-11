import React from 'react'
import Button from './Button'
import { useQueries } from "@tanstack/react-query";
import { fetchSearchPage, textToVideoSearch } from '@/hooks/apiHooks';
import LoadingSpinner from './LoadingSpinner';
import Video from './Video';

interface UserProfileProps {
  profilePic?: string;
  interests?: string[];
  demographics?: {
    age?: number;
    name?: string;
    location?: string;
  };
  emotionAffinities?: string[];
  userId: string;
  indexId: string;
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function UserProfile({
  profilePic = '/default-profile.png',
  interests: initialInterests = [],
  demographics: initialDemographics = {},
  emotionAffinities: initialEmotionAffinities = [],
  userId,
  indexId
}: UserProfileProps) {
  const [newInterest, setNewInterest] = React.useState('');
  const [interests, setInterests] = React.useState(initialInterests);
  console.log("🚀 > interests=", interests)

  const [isSearchClicked, setIsSearchClicked] = React.useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);

  const [demographics, setDemographics] = React.useState(initialDemographics);
  console.log("🚀 > demographics=", demographics)
  const [newDemographicKey, setNewDemographicKey] = React.useState('');
  const [newDemographicValue, setNewDemographicValue] = React.useState('');

  const [nameInput, setNameInput] = React.useState('');
  const [ageInput, setAgeInput] = React.useState('');
  const [locationInput, setLocationInput] = React.useState('');

  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [newKeyInput, setNewKeyInput] = React.useState('');
  const [newValueInput, setNewValueInput] = React.useState('');

  const [emotionAffinities, setEmotionAffinities] = React.useState(initialEmotionAffinities);
  const [newEmotion, setNewEmotion] = React.useState('');

  // Add useEffect to reset search when any value changes
  React.useEffect(() => {
    setIsSearchClicked(false);
  }, [interests, demographics, emotionAffinities]);

  const handleInterestSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setIsSearchClicked(false);
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setIsSearchClicked(false);
    setInterests(interests.filter((_, index) => index !== indexToRemove));
  };

  const removeDemographic = (key: string) => {
    setIsSearchClicked(false);
    const newDemographics = { ...demographics };
    delete newDemographics[key];
    setDemographics(newDemographics);
  };

  const handleEmotionSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newEmotion.trim()) {
      setIsSearchClicked(false);
      setEmotionAffinities([...emotionAffinities, newEmotion.trim()]);
      setNewEmotion('');
    }
  };

  const removeEmotion = (indexToRemove: number) => {
    setIsSearchClicked(false);
    setEmotionAffinities(emotionAffinities.filter((_, index) => index !== indexToRemove));
  };

  // Modified search queries to handle pagination
  const searchQueries = useQueries({
    queries: interests.map((interest) => ({
      queryKey: ["search", interest, userId, isSearchClicked, interests.length],
      queryFn: async () => {
        if (!isSearchClicked) return null;
        try {
          const results = [];
          let currentPageToken = null;

          const initialResponse = await textToVideoSearch(indexId, interest, [
            "visual",
            "audio",
          ], 10);

          results.push(...(initialResponse.data || []));
          currentPageToken = initialResponse.page_info?.next_page_token;

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

  // Combine and deduplicate results
  const allSearchResults = React.useMemo(() => {
    const results = new Map();

    // Add all search results with deduplication
    searchQueries
      .filter(query => query.data?.data && query.isSuccess)
      .forEach(query => {
        // Only include results for current interests
        if (interests.includes(query.data!.searchTerm)) {
          query.data!.data.forEach((item: any) => {
            if (!results.has(item.id)) {
              results.set(item.id, item);
            }
          });
        }
      });

    return Array.from(results.values());
  }, [searchQueries, interests]);
  console.log("🚀 > allSearchResults > allSearchResults=", allSearchResults)

  // Ensure currentVideoIndex is within bounds
  const validCurrentVideoIndex = currentVideoIndex < allSearchResults.length ? currentVideoIndex : 0;

  return (
    <div className="flex flex-col items-center w-[360px]">
      <div className="border rounded-lg p-4 w-full space-y-4">
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden">
            <img
              src={profilePic}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Interests */}
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
              className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-24"
              hidden={interests.length === 5}
            />
          </div>
        </div>

        {/* Demographics */}
        <div className="space-y-2">
          <h3 className="font-semibold">Demographics</h3>
          <div className="flex flex-col gap-2">
            {/* Default demographics Fields */}
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
                      setDemographics({
                        ...demographics,
                        name: nameInput.trim()
                      });
                      setNameInput('');
                    }
                  }}
                  placeholder="Enter name..."
                  className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-40"
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
                      setDemographics({
                        ...demographics,
                        age: parseInt(ageInput.trim())
                      });
                      setAgeInput('');
                    }
                  }}
                  placeholder="Enter age..."
                  className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-40"
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
                      setDemographics({
                        ...demographics,
                        location: locationInput.trim()
                      });
                      setLocationInput('');
                    }
                  }}
                  placeholder="Enter location..."
                  className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-40"
                />
              )}
            </div>

            {/* Additional demographics Fields */}
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
                                setDemographics(newDemographics);
                                setEditingKey(null);
                                setNewKeyInput('');
                              }
                            }}
                            onBlur={() => {
                              setEditingKey(null);
                              setNewKeyInput('');
                            }}
                            className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-24"
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
                                setDemographics({
                                  ...demographics,
                                  [key]: newValueInput.trim()
                                });
                                setEditingValue(null);
                                setNewValueInput('');
                              }
                            }}
                            onBlur={() => {
                              setEditingValue(null);
                              setNewValueInput('');
                            }}
                            className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-40"
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
                                setDemographics({
                                  ...demographics,
                                  [key]: ''
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

            {/* 새로운 key-value 입력 필드 */}
            <div className="flex items-center gap-2">
              <div className="w-32">
                <input
                  type="text"
                  value={newDemographicKey}
                  onChange={(e) => setNewDemographicKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmedKey = e.currentTarget.value.trim();
                      if (trimmedKey) {
                        setTimeout(() => {
                          setDemographics(prev => ({
                            ...prev,
                            [trimmedKey]: null
                          }));
                          setNewDemographicKey('');
                        }, 0);
                      }
                    }
                  }}
                  placeholder="Add field"
                  className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-24"
                />
                <span className="mx-1">:</span>
              </div>

              <input
                type="text"
                value={newDemographicValue}
                onChange={(e) => setNewDemographicValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmedValue = e.currentTarget.value.trim();
                    if (trimmedValue && newDemographicKey) {
                      setTimeout(() => {
                        setDemographics(prev => ({
                          ...prev,
                          [newDemographicKey]: trimmedValue
                        }));
                        setNewDemographicValue('');
                      }, 0);
                    }
                  }
                }}
                placeholder="Add value"
                className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-40"
              />
            </div>
          </div>
        </div>

        {/* Emotion Affinities */}
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
              placeholder="Add emotion..."
              className="px-2 py-1 text-sm bg-transparent outline-none border-gray-300 focus:border-lime-500 w-24"
              hidden={emotionAffinities.length === 5}
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center mt-8 pt-6">
          <Button
            type="button"
            size="sm"
            appearance="primary"
            onClick={() => {
              setIsSearchClicked(true);
            }}
          >
            <div className="flex items-center">
              Search
            </div>
          </Button>
        </div>
        {/* Search Results */}
      {isSearchClicked && (
        <div className="w-full mt-4">
          <h3 className="font-semibold mb-2">Search Results for {demographics.name}</h3>
          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : allSearchResults.length > 0 ? (
            <div className="space-y-2">
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentVideoIndex(prev =>
                      prev === 0 ? allSearchResults.length - 1 : prev - 1
                    )}
                    className="p-2"
                  >
                    <img
                      src="/ChevronLeft.svg"
                      alt="Previous"
                      className="w-5 h-5"
                    />
                  </button>

                  <Video
                    videoId={allSearchResults[validCurrentVideoIndex]?.id}
                    indexId={indexId}
                  />

                  <button
                    onClick={() => setCurrentVideoIndex(prev =>
                      prev === allSearchResults.length - 1 ? 0 : prev + 1
                    )}
                    className="p-2"
                  >
                    <img
                      src="/ChevronRight.svg"
                      alt="Next"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No results found</p>
          )}
        </div>
      )}
      </div>


    </div>
  )
}

export default UserProfile