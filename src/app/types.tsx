import { ButtonHTMLAttributes, ReactNode } from "react";

export interface TaskDetails {
    status: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  }

  export interface AdsProps {
    hashtags: string[];
    setHashtags: (hashtags: string[]) => void;
    indexId: string;
    isIndexIdLoading: boolean;
    footageVideoId: string;
    selectedFile: File | null;
    isRecommendClicked: boolean;
    setIsRecommendClicked: (isRecommendClicked: boolean) => void;
  }

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    appearance?: "primary" | "default" | "danger" | "secondary" | "subtle";
    rounded?: boolean;
    loading?: boolean;
    disableFocusStyle?: boolean;
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

  export interface ClipProps {
      clip: Clip;
      videoDetails: VideoDetails;
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
    metadata: {
      duration: number;
      engine_ids: string[];
      filename: string;
      fps: number;
      height: number;
      size: number;
      video_title: string;
      width: number;
    };
  }

  export interface ClipsProps {
    clips: ClipData[];
    videoDetails: VideoDetails;
  }

  export interface FootageProps {
    setHashtags: (hashtags: string[]) => void;
    indexId: string;
    isIndexIdLoading: boolean;
    footageVideoId: string;
    setFootageVideoId: (footageVideoId: string) => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    setIsRecommendClicked: (isRecommendClicked: boolean) => void;
    }

    export interface FootageSummaryProps {
      videoId: string;
      setHashtags: (hashtags: string[]) => void;
    }

    export interface GistData {
      hashtags: string[];
    }

    export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
      size?: Size;
      color?: Color;
    }

    export interface RecommendedAdProps {
      recommendedAd: {
        id?: string
        clips: Array<object>
      };
      indexId: string;
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

    export interface RecommendedAdsProps {
      hashtags: string[];
      setHashtags: (hashtags: string[]) => void;
      footageVideoId: string;
      indexId: string;
      selectedFile: File | null;
      setIsRecommendClicked: (isRecommendClicked: boolean) => void;
    }

    export interface GistData {
      hashtags: string[];
    }

    export interface SearchResult {
      id: string;
    }

    export interface SearchData {
      data: SearchResult[];
    }

    export interface UploadFormProps {
      indexId: string;
      selectedFile: File | null;
      setSelectedFile: (file: File | null) => void;
      setTaskId: (taskId: string) => void;
      taskId: string | null;
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

    export interface VideoProps {
      video: {
        _id?: string;
        metadata?: VideoMetadata;
        id?: string;
        clips?: object[];
      }
      indexId: string;
      start?: number;
      end?: number;
    }

    export type Size = 'sm' | 'md' | 'lg';
    export type Color = 'default' | 'primary';