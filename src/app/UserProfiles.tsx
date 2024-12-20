import React from 'react'
import UserProfile from './UserProfile'

function UserProfiles({
  indexId,
  profiles,
  setProfiles
}: {
  indexId: string;
  profiles: any[]; // Consider adding proper type definition
  setProfiles: (profiles: any[]) => void;
}) {

  return (
    <div className="max-w-6xl mx-auto flex justify-between gap-1 p-4 mt-16">
      {profiles.map((profile, index) => (
        <UserProfile
          key={profile.userId}
          {...profile}
          indexId={indexId}
          onUpdateProfile={(updatedProfile) => {
            const newProfiles = [...profiles];
            newProfiles[index] = updatedProfile;
            setProfiles(newProfiles);
          }}
        />
      ))}
    </div>
  )
}

export default UserProfiles