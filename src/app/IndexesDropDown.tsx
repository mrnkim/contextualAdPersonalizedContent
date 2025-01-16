import React from 'react';
import { IndexData, IndexesDropDownProps } from '@/app/types';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

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

  // 초기 selectedIndexId 설정
  React.useEffect(() => {
    if (selectedIndexId) {
      setLocalSelectedId(selectedIndexId);
      console.log('초기 selectedIndexId 설정:', selectedIndexId);
    }
  }, []); // 컴포넌트 마운트 시에만 실행

  React.useEffect(() => {
    console.log('indexesData 변경:', {
      pagesCount: indexesData?.pages?.length,
      totalIndexes: loadedIndexes.length,
      selectedId: selectedIndexId,
      localId: localSelectedId
    });

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

        // 선택된 ID가 새로운 데이터에 있는지 확인
        const hasSelectedId = uniqueIndexes.some(index => index._id === selectedIndexId);
        console.log('인덱스 데이터 업데이트:', {
          hasSelectedId,
          selectedId: selectedIndexId,
          totalIndexes: uniqueIndexes.length
        });

        // 선택된 ID가 없고 다음 페이지가 있다면 다음 페이지 로드
        if (!hasSelectedId && hasNextPage && !isFetchingNextPage) {
          console.log('선택된 ID를 찾기 위해 다음 페이지 로드');
          fetchNextPage();
        }

        // 선택된 ID가 있으면 localSelectedId 업데이트
        if (hasSelectedId && selectedIndexId) {
          setLocalSelectedId(selectedIndexId);
        } else if (!localSelectedId && uniqueIndexes.length > 0) {
          // 아직 선택된 ID가 없고 첫 로드라면 첫 번째 인덱스 선택
          setLocalSelectedId(uniqueIndexes[0]._id);
        }

        return uniqueIndexes;
      });
    }
  }, [indexesData?.pages, selectedIndexId, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!loadedIndexes.length) {
    return null;
  }

  // 현재 선택된 ID가 유효한지 확인
  const isValidId = loadedIndexes.some(index => index._id === localSelectedId);
  const effectiveValue = isValidId ? localSelectedId : (loadedIndexes[0]?._id || '');

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newIndexId = event.target.value;
    console.log('드롭다운 선택 변경:', {
      newIndexId,
      previousId: localSelectedId,
      matchingIndex: loadedIndexes.find(index => index._id === newIndexId)?.index_name
    });
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
