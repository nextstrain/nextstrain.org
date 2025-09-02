'use client';

import { useEffect, useRef, startTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createFilterOption } from "./use-filter-options";
import { FilterOption } from "./types";

export function useUrlQueries(
  selectedFilterOptions: readonly FilterOption[],
  setSelectedFilterOptions: React.Dispatch<React.SetStateAction<readonly FilterOption[]>>
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryKey = 'filter';
  /* track if we've just initialised state from the URL so we don't get into a loop */
  const justAppliedFromUrl = useRef(false);

  /* On initial load (or back/forward) set the state from the URL query */
  useEffect(() => {
    const urlValues = searchParams.getAll(queryKey);
    const serializedState = selectedFilterOptions
      .map((opts) => opts.value)
      .sort();
    if (urlValues.join() === serializedState.join()) {
      return
    }
    justAppliedFromUrl.current = true;
    setSelectedFilterOptions(urlValues.map(createFilterOption))
    // don't track changes to selectedFilterOptions as we only want to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, queryKey]);


  /* Update URL query to reflect new state */
  useEffect(() => {
    if (justAppliedFromUrl.current) {
      justAppliedFromUrl.current = false;
      return;
    }
    const serializedState = selectedFilterOptions
      .map((opts) => opts.value)
      .sort();
    const currentQuery = new URLSearchParams(searchParams.toString());
    const previousUrlState = currentQuery.getAll(queryKey);  
    if (previousUrlState.join() === serializedState.join()) {
      return
    }
    currentQuery.delete(queryKey); // deletes all occurrences
    serializedState.forEach((value) => {
      currentQuery.append(queryKey, value);
    })
    const nextUrl = currentQuery.toString().length > 0 ? `${pathname}?${currentQuery}` : pathname;
    startTransition(() => {
      router.push(nextUrl, { scroll: false });
    });
  }, [searchParams, selectedFilterOptions, pathname, router]);
}
