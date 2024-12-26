export const generateGist = async (videoId: string) => {
    const response = await fetch(`/api/generateGist?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
    }
    const data = await response.json();
    return data;
  };

export const generateCustomTexts = async (videoId: string, prompt: string) => {
    const response = await fetch(`/api/generateCustomTexts?videoId=${videoId}&prompt=${prompt}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
    }
    const data = await response.json();
    return data;
  };

export const textToVideoSearch = async (indexId: string, query: string, searchOptions: string[], pageLimit: number=4) => {
    const response = await fetch(`/api/search?indexId=${indexId}&query=${query}&searchOptions=${searchOptions}&pageLimit=${pageLimit}`);
    if (!response.ok) {
      throw new Error("Failed to search videos");
    }
    return response.json();
  };

export const generateChapters = async (videoId: string) => {
    const response = await fetch(`/api/generateChapters?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to search videos");
    }
    return response.json();
  };

export const fetchVideos = async (page: number, indexId: string, pageLimit: number=9) => {
	if (!indexId) {
		throw new Error("ads index ID is required");
	}
	const response = await fetch(`/api/getVideos?indexId=${indexId}&page=${page}&pageLimit=${pageLimit}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
};

export const fetchIndexes = async (page: number, pageLimit: number=9) => {
	const response = await fetch(`/api/getIndexes?page=${page}&pageLimit=${pageLimit}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
};

export const fetchVideoDetails = async (videoId: string, indexId: string, embed: boolean = false) => {
    const response = await fetch(`/api/getVideo?videoId=${videoId}&indexId=${indexId}&embed=${embed}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

export const fetchSearchPage = async (pageToken: string) => {
    const response = await fetch(`/api/getSearchPage?pageToken=${pageToken}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

export const fetchTaskDetails = async (taskId: string) => {

  try {
    const response = await fetch(`/api/getTask?taskId=${taskId}`);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching task details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Uploads footage directly to Twelve Labs API instead of proxying through our backend
 * to bypass Vercel's 4.5MB payload size limitation.
 *
 * @see https://vercel.com/docs/concepts/limits/overview#serverless-function-payload-size-limit
 */
export const uploadFootage = async (file: File, indexId: string) => {

  try {
    const keyResponse = await fetch('/api/getApiKey');
    const { apiKey } = await keyResponse.json();

    const formData = new FormData();
    formData.append('index_id', indexId);
    formData.append('video_file', file);

    const response = await fetch('https://api.twelvelabs.io/v1.3/tasks', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', {
        status: response.status,
        errorText
      });
      throw new Error(`Failed to upload video: ${errorText}`);
    }

    const data = await response.json();
    return { taskId: data._id };
  } catch (error) {
    console.error('Upload error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

export const checkVectorExists = async (indexId: string, videoId: string) => {
  try {
    const response = await fetch(`/api/fetchVectors?indexId=${indexId}&videoId=${videoId}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking vector:', error);
    return false;
  }
};

export const getAndStoreEmbeddings = async (indexId: string, videoId: string, type: string) => {
  try {
    // 1. 먼저 비디오 상세 정보와 임베딩을 가져옴
    const videoDetails = await fetchVideoDetails(videoId, indexId, true);
    console.log("🚀 > getAndStoreEmbeddings > videoDetails=", videoDetails)

    if (!videoDetails.embedding) {
      throw new Error('No embeddings found for video');
    }

    const embedding = videoDetails.embedding;

    // 2. 임베딩을 Pinecone에 저장
    const response = await fetch('/api/storeEmbeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId,
        videoName: videoDetails.metadata.filename,
        embedding: embedding,
        type: type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store embeddings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAndStoreEmbeddings:', error);
    throw error;
  }
};


