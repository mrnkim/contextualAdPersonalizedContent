import React from 'react'
import Clip from './Clip';
import { ClipsProps } from './types';

const Clips: React.FC<ClipsProps> = ({ clips, videoDetails }) => {
  return (
    <div className="flex flex-wrap -mx-2">
      {clips.map((clip, index) => (
        <div key={index} className="w-1/2 px-2 mb-4">
        <Clip clip={clip} videoDetails={videoDetails} />
        </div>
      ))}
    </div>
  )
}

export default Clips
