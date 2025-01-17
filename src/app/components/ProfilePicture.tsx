import React from 'react';

function ProfilePicture({ profilePic }: { profilePic: string }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="w-28 h-28 rounded-full overflow-hidden">
        <img
          src={profilePic}
          alt="Profile Picture"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default ProfilePicture;
