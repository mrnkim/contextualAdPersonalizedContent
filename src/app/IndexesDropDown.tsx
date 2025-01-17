import React, { useEffect } from 'react';
import { IndexData, IndexesDropDownProps } from '@/app/types';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import clsx from 'clsx';

const IndexesDropDown: React.FC<IndexesDropDownProps> = ({
  handleIndexChange,
  indexesData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  selectedIndexId
}) => {
  const [loadedIndexes, setLoadedIndexes] = React.useState<IndexData[]>([]);
  const [localSelectedId, setLocalSelectedId] = React.useState<string>('');

  // Set initial selectedIndexId
  useEffect(() => {
    if (selectedIndexId) {
      setLocalSelectedId(selectedIndexId);
      console.log('Initial selectedIndexId:', selectedIndexId);
    }
  }, []); // Only run on component mount

  useEffect(() => {
    if (indexesData?.pages) {
      const newIndexes = indexesData.pages.flatMap(page => page.data);
      setLoadedIndexes(prev => {
        const combined = [...prev, ...newIndexes];
        const uniqueIndexes = Array.from(
          combined.reduce((map, item) => {
            if (!map.has(item._id)) map.set(item._id, item);
            return map;
          }, new Map()).values()
        );

        // Check if the selected ID is in the new data
        const hasSelectedId = uniqueIndexes.some(index => index._id === selectedIndexId);
        console.log('Index data updated:', {
          hasSelectedId,
          selectedId: selectedIndexId,
          totalIndexes: uniqueIndexes.length
        });

        // If the selected ID is not found and there is a next page, load the next page
        if (!hasSelectedId && hasNextPage && !isFetchingNextPage) {
          console.log('Loading next page to find selected ID');
          fetchNextPage();
        }

        // If the selected ID is found, update localSelectedId
        if (hasSelectedId && selectedIndexId) {
          setLocalSelectedId(selectedIndexId);
        } else if (!localSelectedId && uniqueIndexes.length > 0) {
          // If no selected ID and it's the first load, select the first index
          setLocalSelectedId(uniqueIndexes[0]._id);
        }

        return uniqueIndexes;
      });
    }
  }, [indexesData?.pages, selectedIndexId, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!loadedIndexes.length) {
    return null;
  }

  // Check if the current selected ID is valid
  const isValidId = loadedIndexes.some(index => index._id === localSelectedId);
  const effectiveValue = isValidId ? localSelectedId : (loadedIndexes[0]?._id || '');

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newIndexId = event.target.value;
    setLocalSelectedId(newIndexId);
    handleIndexChange(newIndexId);
  };

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <div className="mx-auto flex justify-center">
      <Select
        value={effectiveValue}
        onChange={handleChange}
        className={clsx('h-9 w-1/3', 'bg-white', 'pl-[1px]', 'truncate text-ellipsis')}
        renderValue={(value) => {
          const selectedIndex = loadedIndexes.find(index => index._id === value);
          console.log('Select renderValue:', {
            value,
            indexName: selectedIndex?.index_name,
            totalOptions: loadedIndexes.length
          });
          return (
            <div className="truncate">
              {selectedIndex?.index_name || "Select an index"}
            </div>
          );
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 48 * 4.5,
            },
            onScroll: handleScroll,
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          variant: "menu"
        }}
      >
        {loadedIndexes.map((index) => {
          return (
            <MenuItem key={index._id} value={index._id}>
              {index.index_name}
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};

export default IndexesDropDown;
