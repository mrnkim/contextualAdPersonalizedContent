import React from 'react'
import UserProfile from './UserProfile'
import { Profile } from '@/app/types';

function UserProfiles({
  indexId,
  profiles,
  setProfiles,
  useEmbeddings,
  processingAdsInPersonalizedContent
}: {
  indexId: string;
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  useEmbeddings: boolean;
  processingAdsInPersonalizedContent: boolean;
}) {

  return (
    <div className="max-w-6xl mx-auto flex justify-between gap-1 p-4 mt-16">
      {profiles.map((profile, index) => (
        <UserProfile
          key={profile.userId}
          {...profile}
          indexId={indexId}
          useEmbeddings={useEmbeddings}
          processingAdsInPersonalizedContent={processingAdsInPersonalizedContent}
          onUpdateProfile={(updatedProfile) => {
            const newProfiles = [...profiles];
            newProfiles[index] = {
              ...profiles[index],
              ...updatedProfile
            };
            setProfiles(newProfiles);
          }}
        />
      ))}
    </div>
  )
}

export default UserProfiles