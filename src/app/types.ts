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
  gistData: GistData;
  customTextsData: string;
  isLoading: boolean;
  error: Error | null;
  setIsRecommendClickedEver: (isRecommendClickedEver: boolean) => void;
  setSelectedAd: (selectedAd: RecommendedAdProps["recommendedAd"] | null) => void;
  setSelectedChapter: (selectedChapter: number | null) => void;
  isAnalyzeClicked: boolean;
  setIsAnalyzeClicked: (isAnalyzeClicked: boolean) => void;
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
}

export interface FootageSummaryProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  gistData: GistData;
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
    id?: string
    clips: Array<object>
  };
  indexId: string;
  videoDetails: VideoDetails;
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
}

export interface IndexesDropDownProps {
  onIndexChange: (id: string) => void;
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
  showTitle?: boolean;
  videoDetails?: VideoDetails;
}

export interface AdCopyProps {
  recommendedAd: RecommendedAdProps["recommendedAd"];
  videoDetails: VideoDetails;
  isAdCopyClicked: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
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
  hls: {
    video_url: string;
    thumbnail_urls: string[];
    status: string;
    updated_at: string;
  };
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  duration: number;
  engine_ids: string[];
  filename: string;
  fps: number;
  height: number;
  size: number;
  video_title: string;
  width: number;
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
  metadata: {
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

export interface GistData {
  hashtags: string[];
}

export interface SearchResult {
  id: string;
  clips?: object[];
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

// Types
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


