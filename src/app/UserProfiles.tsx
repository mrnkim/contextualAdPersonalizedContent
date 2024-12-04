import React from 'react'
import UserProfile from './UserProfile'

function UserProfiles({ indexId }: { indexId: string }) {
  const profiles = [
    {
      profilePic: '/profile1.jpg',
      interests: ['Music', 'Travel'],
      demographics: {
        name: 'Emily',
        age: 19,
        location: 'Los Angeles'
      },
      emotionAffinities: ['Happy', 'Excited', 'Calm'],
      userId: 'user1'
    },
    {
      profilePic: '/profile2.jpg',
      interests: ['Sports', 'Reading', 'Cooking'],
      demographics: {
        name: 'David',
        age: 37,
        location: 'London'
      },
      emotionAffinities: ['Energetic', 'Focused', 'Relaxed'],
      userId: 'user2'
    },
    {
      profilePic: '/profile3.jpg',
      interests: ['Art', 'Fashion', 'Movies'],
      demographics: {
        name: 'Charlotte',
        age: 28,
        location: 'Paris'
      },
      emotionAffinities: ['Creative', 'Inspired', 'Peaceful'],
      userId: 'user3'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto flex justify-between gap-2 p-4 mt-16">
      {profiles.map((profile, index) => (
        <UserProfile key={index} {...profile} indexId={indexId} />
      ))}
    </div>
  )
}

export default UserProfiles