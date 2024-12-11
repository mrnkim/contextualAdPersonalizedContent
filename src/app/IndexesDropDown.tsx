import React from 'react';
import { IndexData, IndexesDropDownProps } from './types';
import { MenuItem, Select, Skeleton, SelectChangeEvent } from '@mui/material'
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';


const IndexesDropDown: React.FC<IndexesDropDownProps> = ({
  handleIndexChange,
  indexesData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  selectedIndexId
}) => {

  // Get all indexes from all pages
  const allIndexes = indexesData?.pages?.flatMap(page => page.data) || [];

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newIndexId = event.target.value;
    handleIndexChange(newIndexId);
  };

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full my-5">
        <LoadingSpinner />
      </div>
    );
  }

  const ITEM_HEIGHT = 48;
  const MENU_MAX_HEIGHT = 5 * ITEM_HEIGHT;

  return (
    <div className="relative">
      <Select
        value={selectedIndexId || ""}
        onChange={handleChange}
        className={clsx('h-9 w-full tablet:w-[200px]', 'bg-white', 'pl-[1px]', 'truncate text-ellipsis')}
        renderValue={(value) => (
          <div className="truncate">
            {allIndexes.find(index => index._id === value)?.index_name || "Select an index"}
          </div>
        )}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: MENU_MAX_HEIGHT,
              width: 200
            }
          },
          MenuListProps: {
            sx: {
              padding: 0,
              maxHeight: MENU_MAX_HEIGHT,
              overflowY: 'auto',
              overflowX: 'hidden'
            },
            onScroll: handleScroll
          }
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6BDE11',
            borderWidth: '1px',
            borderRadius: '0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6BDE11',
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6BDE11',
            borderWidth: '1px',
          },
          '& .MuiSelect-select': {
            padding: '8px 14px',
            borderRadius: '0',
          },
          '& .MuiSelect-icon': {
            right: '7px',
          },
          '& .MuiOutlinedInput-input': {
            padding: '8px 14px',
            borderRadius: '0',
          },
          '& .MuiInputBase-root': {
            borderRadius: '0',
          },
          '& .MuiSelect-outlined': {
            borderRadius: '0',
          },
        }}
      >
        {allIndexes.map((index: IndexData) => (
          <MenuItem
            key={index._id}
            value={index._id}
            sx={{
              paddingX: 1.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              display: 'block',
              width: '100%'
            }}
          >
            {index.index_name}
          </MenuItem>
        ))}
        {isFetchingNextPage && (
          <MenuItem disabled sx={{ alignItems: 'flex-start', flexDirection: 'column', paddingX: 1.5 }}>
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={180} sx={{ mt: 0.5 }} />
          </MenuItem>
        )}
      </Select>
    </div>
  );
};

export default IndexesDropDown;
