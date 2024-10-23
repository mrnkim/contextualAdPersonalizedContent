import React, { useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchIndexes } from '@/hooks/apiHooks';
import { IndexesDropDownProps, Index } from './types';

const IndexesDropDown: React.FC<IndexesDropDownProps> = ({
  onIndexChange,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const { data: indexesData, isLoading: isIndexesLoading } = useQuery<{
    data: Index[];
    page_info: {
      limit_per_page: number;
      page: number;
      total_page: number;
      total_results: number;
    };
  }>({
    queryKey: ['indexes', 1],
    queryFn: () => fetchIndexes(1),
  });

  console.log("🚀 > indexesData=", indexesData);

  const handleChange = () => {
    if (selectRef.current) {
      onIndexChange(selectRef.current.value);
    }
  };

  if (isIndexesLoading) {
    return <div>Loading indexes...</div>;
  }

  return (
    <select ref={selectRef} onChange={handleChange} defaultValue="">
      <option value="">Select an index</option>
      {indexesData?.data.map((index) => (
        <option key={index._id} value={index._id}>
          {index.index_name} ({index.video_count} videos, {index.engines.length} engines)
        </option>
      ))}
    </select>
  );
};

export default IndexesDropDown;
