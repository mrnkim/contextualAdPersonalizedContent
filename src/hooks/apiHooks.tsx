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
    const response = await fetch(`/api/getTask?taskId=${taskId}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

export const uploadFootage = async (file: File, indexId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('indexId', indexId);

  const response = await fetch('/api/uploadVideo', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload video');
  }

  const data = await response.json();
  return data;
};


