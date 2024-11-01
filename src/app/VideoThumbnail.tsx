'use client'

import { useQuery } from '@tanstack/react-query'
import { getThumbnail } from '@/hooks/apiHooks'

interface VideoThumbnailProps {
	videoId: string
	time?: number
    footageIndexId: string
}

const VideoThumbnail = ({ videoId, time = 0, footageIndexId}: VideoThumbnailProps): JSX.Element | null => {

	const { data } = useQuery({
        queryKey: ['video', 'thumbnail', footageIndexId, videoId, time],
		queryFn: () => getThumbnail(footageIndexId, videoId, time),
		enabled: !!footageIndexId && !!videoId
	})

	return <img src={data?.thumbnail} className="w-full h-full"/>
}

export default VideoThumbnail
