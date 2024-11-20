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

export const textToVideoSearch = async (indexId: string, query: string, searchOptions: string[]) => {
    const response = await fetch(`/api/search?indexId=${indexId}&query=${query}&searchOptions=${searchOptions}`);
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

export const fetchVideos = async (page: number, indexId: string) => {
	if (!indexId) {
		throw new Error("ads index ID is required");
	}
	const response = await fetch(`/api/getVideos?indexId=${indexId}&page=${page}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
};

export const fetchVideoDetails = async (videoId: string, indexId: string) => {
    const response = await fetch(`/api/getVideo?videoId=${videoId}&indexId=${indexId}`);
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
  console.log('Fetching task details:', { taskId });

  try {
    const response = await fetch(`/api/getTask?taskId=${taskId}`);
    console.log('Task details response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log('Task details data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching task details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

export const uploadFootage = async (file: File, indexId: string) => {
  console.log('Starting uploadFootage:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    indexId
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('indexId', indexId);

  try {
    console.log('Sending upload request...');
    const response = await fetch('/api/uploadVideo', {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
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
    console.log('Upload successful:', data);
    return data;
  } catch (error) {
    console.error('Upload error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};


