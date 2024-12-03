import React from 'react'
import IndexVideos from './IndexVideos';
import UserProfiles from './UserProfiles';

const PersonalizedContent = ({adsIndexId}: {adsIndexId:string}) => {
  return (
    <div className="w-full max-w-7xl mx-auto">
    <h1 className="text-3xl font-bold text-center mb-16">Personalized Content</h1>
    <IndexVideos
      indexId={adsIndexId}
      isIndexIdLoading={!adsIndexId}
    />
    <UserProfiles />

  </div>
  )
}

export default PersonalizedContent
