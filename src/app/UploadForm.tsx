import React, { useRef } from 'react';
import { useMutation } from "@tanstack/react-query";
import { uploadFootage } from '@/hooks/apiHooks';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { UploadFormProps } from './types';

function UploadForm({ indexId, selectedFile, setSelectedFile, setTaskId, taskId }: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFootage(file, indexId),
    onSuccess: (data) => {
      setTaskId(data.taskId);
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-end items-center w-full my-3">
        <Button
          type="button"
          size="sm"
          appearance="default"
          onClick={handleUploadClick}
          disabled={!!selectedFile || !!taskId}
        >
          <img
            src={selectedFile ? "/uploadDisabled.svg" : "/upload.svg"}
            alt="upload icon"
            className="w-4 h-4"
          />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      {uploadMutation.isPending && <LoadingSpinner />}
      {uploadMutation.isError && <ErrorFallback error={uploadMutation.error}/>}
    </div>
  );
}

export default UploadForm;

