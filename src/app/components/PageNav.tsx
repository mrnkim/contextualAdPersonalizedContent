import React, { useMemo, useCallback } from "react";
import clsx from "clsx";

const PageNav: React.FC<{
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPage: number;
}> = ({ page, setPage, totalPage }) => {
  const MAX_PAGES_TO_SHOW = 5;

  const pageRange = Math.floor(MAX_PAGES_TO_SHOW / 2);

  /** Generates an array of page numbers for pagination, including ellipses for skipped ranges */
  const pagesArray = useMemo(() => {
    let pages = [];
    let startPage = Math.max(1, page - pageRange);
    const endPage = Math.min(totalPage, page + pageRange);

    if (totalPage <= MAX_PAGES_TO_SHOW) {
      pages = Array.from({ length: totalPage }, (_, index) => index + 1);
    } else {
      if (startPage > 2) {
        pages.push(1, "...");
      } else {
        startPage = 1;
      }

      pages.push(
        ...Array.from(
          { length: endPage - startPage + 1 },
          (_, index) => startPage + index
        )
      );

      if (endPage < totalPage - 1) {
        pages.push("...", totalPage);
      }
    }

    return pages;
  }, [page, totalPage, pageRange, MAX_PAGES_TO_SHOW]);

  /** Handles page click events, updating the current page unless the clicked item is an ellipsis */
  const handlePageClick = useCallback(
    (pg: number | string) => {
      if (pg !== "...") {
        setPage(pg as number);
      }
    },
    [setPage]
  );

  /** Advances to the next page if not already at the last page */
  const nextPage = () => {
    if (page < totalPage) setPage(page + 1);
  };

  /** Goes back to the previous page if not already at the first page */
  const previousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <nav
      className={clsx(
        "pageNav",
        "flex",
        "items-center",
        "px-1.5",
        "gap-x-[1.5rem]"
      )}
    >
      <button
        onClick={previousPage}
        disabled={page === 1}
        className={clsx(
          "text-black bg-transparent outline-none flex-shrink-0 w-[1.5rem] h-[1.5rem] rounded-full transition-colors duration-300 m-[0.38rem] border-none",
          page === 1 && "cursor-not-allowed"
        )}
      >
        <img
          src={page === 1 ? "/ChevronLeftDisabled.svg" : "/ChevronLeft.svg"}
          alt="Previous"
        />
      </button>
      {pagesArray?.map((pg) => (
        <button
          key={pg}
          className={clsx(
            "text-xs text-black bg-transparent outline-none flex-shrink-0 w-[1.5rem] h-[1.5rem] rounded-full transition-colors duration-300 m-[0.38rem] border-none",
            pg === page && "bg-[#D4D5D2] font-medium"
          )}
          disabled={pg === "..."}
          onClick={() => handlePageClick(pg)}
        >
          {pg}
        </button>
      ))}
      <button
        onClick={nextPage}
        disabled={page === totalPage}
        className={clsx(
          "text-black bg-transparent outline-none flex-shrink-0 w-[1.5rem] h-[1.5rem] rounded-full transition-colors duration-300 m-[0.38rem] border-none",
          page === totalPage && "cursor-not-allowed"
        )}
      >
        <img
          src={
            page === totalPage
              ? "/ChevronRightDisabled.svg"
              : "/ChevronRight.svg"
          }
          alt="Next"
        />
      </button>
    </nav>
  );
};

export default PageNav;
