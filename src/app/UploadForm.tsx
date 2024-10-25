import React, { useRef } from 'react';
import Button from './Button';
import { UploadFormProps } from './types';

function UploadForm({ selectedFile, taskId, onFileUpload}: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
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
            src={!!selectedFile || !!taskId ? "/uploadDisabled.svg" : "/upload.svg"}
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
    </div>
  );
}

export default UploadForm;
