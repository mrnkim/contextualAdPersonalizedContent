import { ButtonHTMLAttributes, ReactNode } from "react";

// UI Component Props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  appearance?: "primary" | "default" | "danger" | "secondary" | "subtle";
  rounded?: boolean;
  loading?: boolean;
  disableFocusStyle?: boolean;
}

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size;
  color?: Color;
}

export interface FootageProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  indexId: string;
  isIndexIdLoading: boolean;
  footageVideoId: string;
  setFootageVideoId: (footageVideoId: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  setIsRecommendClicked: (isRecommendClicked: boolean) => void;
  emotions: string[];
  setEmotions: (emotions: string[]) => void;
  gistData: string;
  customTextsData: string;
  isLoading: boolean;
  error: Error | null;
  setIsRecommendClickedEver: (isRecommendClickedEver: boolean) => void;
  setSelectedAd: (selectedAd: RecommendedAdProps["recommendedAd"] | null) => void;
  setSelectedChapter: (selectedChapter: number | null) => void;
  isAnalyzeClicked: boolean;
  setIsAnalyzeClicked: (isAnalyzeClicked: boolean) => void;
  hasProcessedFootage: boolean;
  setHasProcessedFootage: (hasProcessedFootage: boolean) => void;
  useEmbeddings: boolean;
}

export interface AdsProps {
  indexId: string;
  isIndexIdLoading: boolean;
  selectedFile: File | null;
  isRecommendClicked: boolean;
  setIsRecommendClicked: (isRecommendClicked: boolean) => void;
  searchOptionRef: React.RefObject<HTMLFormElement>;
  customQueryRef: React.RefObject<HTMLInputElement>;
  isAnalysisLoading: boolean;
  setIsRecommendClickedEver: (isRecommendClickedEver: boolean) => void;
  isRecommendClickedEver: boolean;
  setSelectedAd: (selectedAd: RecommendedAdProps["recommendedAd"] | null) => void;
  setSelectedChapter: (selectedChapter: number | null) => void;
  hashtags: string[];
  hasProcessedAds: boolean;
  setHasProcessedAds: (hasProcessedAds: boolean) => void;
  hasProcessedFootage: boolean;
  useEmbeddings: boolean;
}

export interface FootageSummaryProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  gistData: string;
  customTextsData: string;
  isLoading: boolean;
  error: Error | null;
  setShowAnalysis: (showAnalysis: boolean) => void;
}

export interface VideosDropDownProps {
  indexId: string;
  onVideoChange: (footageVideoId: string) => void;
  videosData: {
    pages: VideoPage[];
    pageParams: number[];
  };
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  selectedFile: File | null;
  taskId: string | null;
  footageVideoId: string | null;
}

export interface TaskProps {
  taskDetails: TaskDetails;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
 }

export interface RecommendedAdProps {
  recommendedAd: {
    id: string;
    indexId: string;
    videoDetails: {
      hls: {
        metadata: {
          filename: string;
          video_title: string;
        }
      }
    };
    clips: Array<{
      score: number;
    }>;
  };
  indexId: string;
  videoDetails?: VideoDetails;
}

export interface RecommendedAdsProps {
  hashtags: string[];
  footageVideoId: string;
  footageIndexId: string;
  adsIndexId: string;
  selectedFile: File | null;
  isRecommendClicked: boolean;
  setIsRecommendClicked: (isRecommendClicked: boolean) => void;
  searchOptionRef: React.RefObject<HTMLFormElement>;
  customQueryRef: React.RefObject<HTMLInputElement>;
  emotions: string[];
  selectedAd: RecommendedAdProps["recommendedAd"] | null;
  setSelectedAd: (selectedAd: RecommendedAdProps["recommendedAd"] | null) => void;
  selectedChapter: number | null;
  setSelectedChapter: (selectedChapter: number | null) => void;
  useEmbeddings: boolean;
}

export interface RecommendedPlacementsProps {
  footageVideoId: string;
  footageIndexId: string;
  selectedAd: RecommendedAdProps["recommendedAd"] | null;
  adsIndexId: string;
  selectedChapter: number | null;
  setSelectedChapter: (selectedChapter: number | null) => void;
}

export interface RecommendOptionFormProps {
  searchOptionRef: React.RefObject<HTMLFormElement>;
  customQueryRef: React.RefObject<HTMLInputElement>;
  setIsRecommendClicked: (isRecommendClicked: boolean) => void;
  setHasSearchOptionChanged: (hasSearchOptionChanged: boolean) => void;
}

export interface UploadFormProps {
  selectedFile: File | null;
  taskId: string | null;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  isAnalyzeClicked: boolean;
}

export interface IndexData {
  _id: string;
  index_name: string;
  models: string[];
  video_count: number;
  total_duration: number;
  addons: string[];
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface IndexPageInfo {
  page: number;
  limit_per_page: number;
  total_page: number;
  total_results: number;
}

export interface IndexesResponse {
  data: IndexData[];
  page_info: IndexPageInfo;
}

export interface IndexesData {
  pages: IndexesResponse[];
  pageParams: number[];
}

export interface IndexesDropDownProps {
  handleIndexChange: (indexId: string) => void;
  indexesData: IndexesData;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  selectedIndexId: string | null;
}

// Video Related Interfaces
export interface ClipProps {
  clip: Clip;
  videoDetails: VideoDetails;
}

export interface ClipsProps {
  clips: ClipData[];
  videoDetails: VideoDetails;
}

export interface VideoProps {
  videoId: string;
  indexId: string;
  playing: boolean;
  onPlay: () => void;
  onSelect?: () => void;
  onPause?: () => void;
  showTitle?: boolean;
  videoDetails?: VideoDetails;
}

export interface AdCopyProps {
  videoDetails: VideoDetails;
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  adCopyData: string | null;
}


export interface Index {
  _id: string;
  index_name: string;
  engines: object[];
  video_count: number;
  total_duration: number;
  addons: string[];
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface Clip {
  confidence: "low" | "medium" | "high";
  end: number;
  metadata: Array<{ type: string }>;
  modules: Array<{ type: string, confidence: string }>;
  start: number;
  score: number;
  thumbnail_url: string;
  video_id: string;
}

export interface ClipData {
  confidence: "low" | "medium" | "high";
  end: number;
  metadata: Array<{ type: string }>;
  modules: Array<{ type: string, confidence: string }>;
  start: number;
  score: number;
  thumbnail_url: string;
  video_id: string;
}

export interface VideoDetails {
  hls?: {
    video_url: string;
    thumbnail_urls: string[];
    status: string;
    updated_at: string;
  };
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  duration?: number;
  engine_ids?: string[];
  filename: string;
  fps?: number;
  height?: number;
  size?: number;
  video_title: string;
  width?: number;
}

export interface VideoHLS {
  status: string;
  thumbnail_urls: string[];
  updated_at: string;
  video_url: string;
}

export interface Video {
  _id: string;
  created_at: string;
  updated_at?: string;
  indexed_at: string;
  system_metadata: {
    filename: string;
  };
}

export interface TaskDetails {
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    duration: number;
    filename: string;
    fps: number;
    height: number;
    width: number;
  }
}


export interface SearchData {
  data: SearchResult[];
}

export interface ChaptersData  {
  chapters: Chapter[];
}

export interface Chapter {
  chapter_number: number;
  start: number;
  end: number;
  chapter_title: string;
  chapter_summary: string;
}

export type Size = 'sm' | 'md' | 'lg';
export type Color = 'default' | 'primary';

export interface VideoPage {
  data: Video[];
  page_info: {
    limit_per_page: number;
    page: number;
    total_duration: number;
    total_page: number;
    total_results: number;
  };
}

export interface VideosData {
  pages: VideoPage[];
  pageParams: number[];
}

export interface RecommendedAdItemProps {
  recommendedAd: RecommendedAdProps["recommendedAd"];
  adsIndexId: string;
  score?: number;
}

export interface Demographics {
  name: string;
  age: number;
  location: string;
  [key: string]: string | number;
}

export interface DemographicsSectionProps {
  demographics: Demographics;
  onUpdateProfile: (updatedProfile: Partial<Profile>) => void;
  profileData: Partial<Profile>;
  setIsSearchClicked: (value: boolean) => void;
}

export interface EmotionAffinitiesSectionProps {
  emotionAffinities: string[];
  onUpdateProfile: (updatedProfile: Partial<Profile>) => void;
  profileData: Partial<Profile>;
  setIsSearchClicked: (value: boolean) => void;
}

export interface InterestsSectionProps {
  interests: string[];
  onUpdateProfile: (updatedProfile: Partial<Profile>) => void;
  profileData: Partial<Profile>;
  setIsSearchClicked: (value: boolean) => void;
}

interface SearchResult {
  id: string;
}

export interface SearchResultsProps {
  isLoading: boolean;
  searchResults: SearchResult[];
  demographics: Demographics;
  userId: string;
  indexId: string;
}

export interface UserProfileProps extends Profile {
  indexId: string;
  onUpdateProfile: (updatedProfile: Partial<Profile>) => void;
  useEmbeddings: boolean;
  processingAdsInPersonalizedContent: boolean;
}

export interface VideoItem {
  id: string;
  clips: Clip[];
}

export interface Profile {
  profilePic: string;
  interests: string[];
  demographics: Demographics;
  emotionAffinities: string[];
  userId: string;
}

export interface ContextualAdsProps {
  adsIndexId: string;
  profiles: Array<{
    profilePic: string;
    interests: string[];
    demographics: {
      name: string;
      age: number;
      location: string;
    };
    emotionAffinities: string[];
    userId: string;
  }>;
  setProfiles: React.Dispatch<React.SetStateAction<ContextualAdsProps['profiles']>>;
  hasProcessedAds: boolean;
  setHasProcessedAds: (hasProcessedAds: boolean) => void;
  hasProcessedFootage: boolean;
  setHasProcessedFootage: (hasProcessedFootage: boolean) => void;
  useEmbeddings: boolean;
}

export interface Vector {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

export interface VectorMetadata {
  video_file: string;
  video_segment: number;
  start_time: number;
  end_time: number;
  scope: string;
  video_type: string;
  tl_video_id: string;
}

export interface Segment {
  embedding_scope: string;
  end_offset_sec: number;
  float: number[];
  start_offset_sec: number;
}