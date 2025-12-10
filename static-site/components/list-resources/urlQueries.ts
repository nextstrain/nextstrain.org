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
  const nameQueryKey = 'filter';
  const typeQueryKey = 'type';
  /* track if we've just initialised state from the URL so we don't get into a loop */
  const justAppliedFromUrl = useRef(false);

  /* On initial load (or back/forward) set the state from the URL query */
  useEffect(() => {
    const urlNameValues = searchParams.getAll(nameQueryKey);
    const urlTypeValues = searchParams.getAll(typeQueryKey);

    const stateNameValues = selectedFilterOptions
      .filter(opt => opt.filterType === 'namePart')
      .map(opt => opt.value);
    const stateTypeValues = selectedFilterOptions
      .filter(opt => opt.filterType === 'resourceType')
      .map(opt => opt.value);

    if (urlNameValues.sort().join() === stateNameValues.sort().join() &&
        urlTypeValues.sort().join() === stateTypeValues.sort().join()) {
      return
    }

    justAppliedFromUrl.current = true;
    setSelectedFilterOptions([
      ...urlNameValues.map(val => createFilterOption(val, 'namePart')),
      ...urlTypeValues.map(val => createFilterOption(val, 'resourceType'))
    ]);
    // don't track changes to selectedFilterOptions as we only want to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, nameQueryKey, typeQueryKey]);


  /* Update URL query to reflect new state */
  useEffect(() => {
    if (justAppliedFromUrl.current) {
      justAppliedFromUrl.current = false;
      return;
    }

    const stateNameValues = selectedFilterOptions
      .filter(opt => opt.filterType === 'namePart')
      .map(opt => opt.value);
    const stateTypeValues = selectedFilterOptions
      .filter(opt => opt.filterType === 'resourceType')
      .map(opt => opt.value);

    const currentQuery = new URLSearchParams(searchParams.toString());
    const previousNameValues = currentQuery.getAll(nameQueryKey);
    const previousTypeValues = currentQuery.getAll(typeQueryKey);

    if (previousNameValues.sort().join() === stateNameValues.sort().join() &&
        previousTypeValues.sort().join() === stateTypeValues.sort().join()) {
      return
    }

    const newQuery = new URLSearchParams();

    stateNameValues.forEach((value) => {
      newQuery.append(nameQueryKey, value);
    });
    stateTypeValues.forEach((value) => {
      newQuery.append(typeQueryKey, value);
    })

    const nextUrl = newQuery.toString().length > 0 ? `${pathname}?${newQuery}` : pathname;
    startTransition(() => {
      router.push(nextUrl, { scroll: false });
    });
  }, [searchParams, selectedFilterOptions, pathname, router]);
}
