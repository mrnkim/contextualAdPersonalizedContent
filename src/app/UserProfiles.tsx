import React from 'react'
import UserProfile from './UserProfile'

function UserProfiles() {
  const profiles = [
    {
      profilePic: '/profile1.jpg',
      interests: ['Technology', 'Music', 'Travel'],
      demographics: {
        age: 25,
        gender: 'Female',
        location: 'Los Angeles'
      },
      emotionAffinities: ['Happy', 'Excited', 'Calm']
    },
    {
      profilePic: '/profile2.jpg',
      interests: ['Sports', 'Reading', 'Cooking'],
      demographics: {
        age: 30,
        gender: 'Male',
        location: 'London'
      },
      emotionAffinities: ['Energetic', 'Focused', 'Relaxed']
    },
    {
      profilePic: '/profile3.jpg',
      interests: ['Art', 'Fashion', 'Movies'],
      demographics: {
        age: 28,
        gender: 'Female',
        location: 'Paris'
      },
      emotionAffinities: ['Creative', 'Inspired', 'Peaceful']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto flex justify-between gap-2 p-4 mt-16">
      {profiles.map((profile, index) => (
        <UserProfile key={index} {...profile} />
      ))}
    </div>
  )
}

export default UserProfiles