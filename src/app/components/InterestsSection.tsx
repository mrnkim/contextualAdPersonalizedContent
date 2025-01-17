import React, { useState } from 'react';
import { InterestsSectionProps } from '@/app/types';

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function InterestsSection({
  interests,
  onUpdateProfile,
  profileData,
  setIsSearchClicked
}: InterestsSectionProps) {
  const [newInterest, setNewInterest] = useState('');

  const handleInterestSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setIsSearchClicked(false);
      onUpdateProfile({
        ...profileData,
        interests: [...interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setIsSearchClicked(false);
    onUpdateProfile({
      ...profileData,
      interests: interests.filter((_, index) => index !== indexToRemove),
    });
  };

  return (
    <div className="space-y-2 h-[90px]">
      <h3 className="font-semibold">Interests</h3>
      <div className="flex flex-wrap gap-2 items-center">
        {interests.map((interest, index) => (
          <span
            key={index}
            className="bg-grey-100 px-2 py-1 rounded text-sm flex items-center gap-1"
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
  );
}

export default InterestsSection;
