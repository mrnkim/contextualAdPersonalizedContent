import React from 'react'
import Button from './Button'
import { useQueries } from "@tanstack/react-query";
import { fetchSearchPage, textToVideoSearch } from '@/hooks/apiHooks';
import LoadingSpinner from './LoadingSpinner';

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

function UserProfile({
  profilePic = '/default-profile.png',
  interests: initialInterests = [],
  demographics = {},
  emotionAffinities = [],
  userId,
  indexId
}: UserProfileProps) {
  const [newInterest, setNewInterest] = React.useState('');
  const [interests, setInterests] = React.useState(initialInterests);
  console.log("🚀 > interests=", interests)

  const [isSearchClicked, setIsSearchClicked] = React.useState(false);

  const handleInterestSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setInterests(interests.filter((_, index) => index !== indexToRemove));
  };

  // Modified search queries to handle pagination
  const searchQueries = useQueries({
    queries: interests.map((interest) => ({
      queryKey: ["search", interest, userId],
      queryFn: async () => {
        if (!isSearchClicked) return null;
        try {
          const results = [];
          let currentPageToken = null;

          const initialResponse = await textToVideoSearch(indexId, interest, [
            "visual",
            "conversation",
            "text_in_video",
            "logo"
          ], 10);

          results.push(...(initialResponse.data || []));
          currentPageToken = initialResponse.page_info?.next_page_token;

          while (currentPageToken) {
            const nextPage = await fetchSearchPage(currentPageToken);
            results.push(...(nextPage.data || []));
            currentPageToken = nextPage.page_info?.next_page_token;
          }

          console.log("🚀 > queryFn: > results=", results)
          return { data: results };
        } catch (error) {
          console.error(`Search error for "${interest}":`, error);
          return { data: [] };
        }
      },
      enabled: isSearchClicked,
    })),
  });

  const isLoading = searchQueries.some(query => query.isLoading);

  // Combine and deduplicate results
  const allSearchResults = React.useMemo(() => {
    const results = new Map();

    // Add all search results with deduplication
    searchQueries
      .filter(query => query.data?.data)
      .forEach(query => {
        query.data!.data.forEach((item: any) => {
          if (!results.has(item.id)) {
            results.set(item.id, item);
          }
        });
      });

    return Array.from(results.values());
  }, [searchQueries]);

  console.log("🚀 > allSearchResults=", allSearchResults)
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border rounded-lg p-4 w-80 space-y-4">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full overflow-hidden ">
            <img
              src={profilePic}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <h3 className="font-semibold">Interests</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="bg-lime-200 px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {interest}
                <button
                  onClick={() => removeInterest(index)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
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
              hidden={interests.length === 3}
            />
          </div>
        </div>

        {/* Demographics */}
        <div className="space-y-2">
          <h3 className="font-semibold">Demographics</h3>
          <div className="bg-lime-200 p-2 rounded">
            <p>Name: {demographics.name}</p>
            <p>Age: {demographics.age}</p>
            <p>Location: {demographics.location}</p>
          </div>
        </div>

        {/* Emotion Affinities */}
        <div className="space-y-2">
          <h3 className="font-semibold">Emotion Affinities</h3>
          <div className="flex flex-wrap gap-2">
            {emotionAffinities.map((emotion, index) => (
              <span
                key={index}
                className="bg-green-500-500 px-2 py-1 rounded text-sm"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
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
      </div>

      {/* Search Results */}
      {isSearchClicked && (
        <div className="w-80 mt-4">
          <h3 className="font-semibold mb-2">Search Results</h3>
          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : allSearchResults.length > 0 ? (
            <div className="space-y-2">
              {allSearchResults.map((result: any) => (
                <div key={result.id} className="border rounded p-2">
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-gray-600">{result.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default UserProfile