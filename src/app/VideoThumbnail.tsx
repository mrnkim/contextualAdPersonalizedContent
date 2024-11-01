'use client'

import { useQuery } from '@tanstack/react-query'
import { getThumbnail } from '@/hooks/apiHooks'

interface VideoThumbnailProps {
	videoId: string
	time?: number
    indexId: string
}

const VideoThumbnail = ({ videoId, time = 0, indexId}: VideoThumbnailProps): JSX.Element | null => {

	const { data } = useQuery({
        queryKey: ['video', 'thumbnail', indexId, videoId, time],
		queryFn: () => getThumbnail(indexId, videoId, time),
		enabled: !!indexId && !!videoId
	})

	return <img src={data?.thumbnail} className="w-full h-full"/>
}

export default VideoThumbnail
