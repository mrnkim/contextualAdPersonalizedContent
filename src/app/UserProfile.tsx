import React from 'react'
import Button from './Button'

interface UserProfileProps {
  profilePic?: string;
  interests?: string[];
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  emotionAffinities?: string[];
}

function UserProfile({
  profilePic = '/default-profile.png',
  interests: initialInterests = [],
  demographics = {},
  emotionAffinities = []
}: UserProfileProps) {
  const [newInterest, setNewInterest] = React.useState('');
  const [interests, setInterests] = React.useState(initialInterests);
  console.log("🚀 > interests=", interests)

  const handleInterestSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setInterests(interests.filter((_, index) => index !== indexToRemove));
  };

  return (
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
          />
        </div>
      </div>

      {/* Demographics */}
      <div className="space-y-2">
        <h3 className="font-semibold">Demographics</h3>
        <div className="bg-lime-200 p-2 rounded">
          <p>Age: {demographics.age}</p>
          <p>Gender: {demographics.gender}</p>
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
              className="bg-lime-200 px-2 py-1 rounded text-sm"
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
      >
        <div className="flex items-center">
            Search
        </div>
     </Button>
     </div>
    </div>
  )
}

export default UserProfile