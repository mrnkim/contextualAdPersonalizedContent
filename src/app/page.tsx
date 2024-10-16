"use client";

import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import Footage from './Footage';
import Ads from './Ads';
import { fetchFootageIndexId, fetchAdsIndexId } from '@/hooks/apiHooks';

export default function Page() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [footageVideoId, setFootageVideoId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: footageIndexId, isLoading: isFootageIndexIdLoading } = useQuery({
    queryKey: ['footageIndexId'],
    queryFn: fetchFootageIndexId,
  });

  const { data: adsIndexId, isLoading: isAdsIndexIdLoading } = useQuery({
    queryKey: ['adsIndexId'],
    queryFn: fetchAdsIndexId,
  });

 return (
    <main className="flex min-h-screen p-24">
    <div className="flex w-full max-w-7xl mx-auto">
      <div className="w-1/2 pr-4">
      <Footage
        setHashtags={setHashtags}
        indexId={footageIndexId?.footageIndexId}
        isIndexIdLoading={isFootageIndexIdLoading}
        footageVideoId={footageVideoId}
        setFootageVideoId={setFootageVideoId}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />      </div>
      <div className="w-1/2 pl-4">
      <Ads
        hashtags={hashtags}
        setHashtags={setHashtags}
        indexId={adsIndexId?.adsIndexId}
        isIndexIdLoading={isAdsIndexIdLoading}
        footageVideoId={footageVideoId}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
      </div>
    </div>
  </main>
  );
}