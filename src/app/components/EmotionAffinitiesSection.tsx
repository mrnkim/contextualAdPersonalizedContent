import React, { useState } from 'react';
import { EmotionAffinitiesSectionProps } from '@/app/types';

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function EmotionAffinitiesSection({
  emotionAffinities,
  onUpdateProfile,
  profileData,
  setIsSearchClicked
}: EmotionAffinitiesSectionProps) {
  const [newEmotion, setNewEmotion] = useState('');

  const handleEmotionSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newEmotion.trim()) {
      setIsSearchClicked(false);
      onUpdateProfile({
        ...profileData,
        emotionAffinities: [...emotionAffinities, newEmotion.trim()]
      });
      setNewEmotion('');
    }
  };

  const removeEmotion = (indexToRemove: number) => {
    setIsSearchClicked(false);
    onUpdateProfile({
      ...profileData,
      emotionAffinities: emotionAffinities.filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <div className="space-y-2 h-[90px]">
      <h3 className="font-semibold">Emotion Affinities</h3>
      <div className="flex flex-wrap gap-2 items-center">
        {emotionAffinities.map((emotion, index) => (
          <span
            key={index}
            className="bg-grey-100 px-2 py-1 rounded text-sm flex items-center gap-1"
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
  );
}

export default EmotionAffinitiesSection;
