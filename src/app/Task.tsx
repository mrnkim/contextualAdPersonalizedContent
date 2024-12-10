import React, { JSX } from 'react'
import LoadingSpinner from './LoadingSpinner';
import ReactPlayer from "react-player";
import clsx from "clsx";
import { TaskProps } from './types';
import VideoSkeleton from './VideoSkeleton';

const Task = ({ taskDetails, playing, setPlaying }: TaskProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full max-w-sm gap-4 items-center">
		{taskDetails && <div className="capitalize text-center">{taskDetails.status}...</div>}
		<LoadingSpinner />
		{taskDetails && (
			taskDetails.videoUrl ? (
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
			) : (
				<VideoSkeleton />
			)
		)}
		{taskDetails?.metadata?.filename && (
			<div className="w-full">
				<p className={clsx("text-body3", "truncate", "text-grey-700")}>
						{taskDetails.system_metadata.filename}
				</p>
			</div>
		)}
	</div>
  )
}

export default Task
