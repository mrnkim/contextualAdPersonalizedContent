import React from 'react'
import LoadingSpinner from './LoadingSpinner';
import ReactPlayer from "react-player";

interface TaskDetails {
    status: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  }

const Task = ({ taskDetails, playing, setPlaying }: { taskDetails: TaskDetails, playing: boolean, setPlaying: (playing: boolean) => void }) => {
  return (
    <div className="flex flex-col w-full max-w-sm gap-4 items-center">
					<LoadingSpinner />
					{taskDetails && <div className="capitalize text-center">{taskDetails.status}...</div>}
					{taskDetails && taskDetails.videoUrl &&
					 <div className="w-full aspect-video relative overflow-hidden rounded cursor-pointer" onClick={() => setPlaying(!playing)}>
						<ReactPlayer
							url={taskDetails.videoUrl}
							controls
							width="100%"
							height="100%"
							style={{ position: 'absolute', top: 0, left: 0 }}
							light={
							<img
								src={
								taskDetails.thumbnailUrl ||
								'/videoFallback.jpg'
								}
								className="object-cover w-full h-full"
								alt="thumbnail"
							/>
							}
							playing={playing}
							config={{
							file: {
								attributes: {
								preload: "auto",
								},
							},
							}}
							progressInterval={100}
					/>
					    </div>
					}
				</div>
  )
}

export default Task
