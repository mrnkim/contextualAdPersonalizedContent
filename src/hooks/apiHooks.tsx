export const generateGist = async (videoId: string) => {
    const response = await fetch(`/api/generateGist?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
    }
    const data = await response.json();
    return data;
  };

  export const generateCustomTexts = async (videoId: string): Promise<void> => {
    const response = await fetch(`/api/generateCustomTexts?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
    }
    return response.json();
  };

  export const textToVideoSearch = async (indexId: string, query: string): Promise<void> => {
    const response = await fetch(`/api/search?indexId=${indexId}&query=${query}`);
    if (!response.ok) {
      throw new Error("Failed to generate gist");
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

 export const fetchVideoDetail = async (videoId: string, indexId: string) => {
    const response = await fetch(`/api/getVideo?videoId=${videoId}&indexId=${indexId}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

export async function fetchAdsIndexId() {
  const response = await fetch('/api/getAdsIndexId');
  if (!response.ok) {
    throw new Error("Failed to fetch ads index ID");
  }
  return await response.json();
}

export async function fetchFootageIndexId() {
  const response = await fetch('/api/getFootageIndexId');
  if (!response.ok) {
    throw new Error("Failed to fetch footage index ID");
  }
  return await response.json();
}

