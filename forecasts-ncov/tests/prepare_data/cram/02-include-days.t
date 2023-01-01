Setup

  $ pushd "$TESTDIR" > /dev/null

Prepared data with the max date 2022-01-10, which is the last date of the test data.
Only include 5 days in analysis.
The outputs should be subsets of the variants counts and case counts.

  $ python3 ../../../scripts/prepare-data.py \
  > --clades ../data/nextstrain_clades.tsv \
  > --cases ../data/cases.tsv \
  > --max-date 2022-01-10 \
  > --included-days 5 \
  > --clade-to-variant ../data/clade_to_variant.tsv \
  > --output-variants "$TMP/prepared_variants.tsv" \
  > --output-cases "$TMP/prepared_cases.tsv"
  Setting max date (inclusive) as '2022-01-10'.
  Setting min date (inclusive) as '2022-01-06'.
  Only including locations that have at least 1 sequence(s) in the analysis date range.
  Locations that will be included: ['Argentina', 'Japan', 'USA', 'United Kingdom'].
  Variants that will be included: ['19A', '20A', '20B', '20C', '20I (Alpha, V1)', '21A (Delta)', '21I (Delta)', '21J (Delta)', '21K (Omicron)', '21L (Omicron)', '21M (Omicron)', 'recombinant'].

Verify that the output variants counts is a subset with expected locations, variants, and dates.

  $ wc -l < "$TMP/prepared_variants.tsv" | sed 's/^[[:space:]]*//'
  87
  $ echo $(tsv-select -H -f location "$TMP/prepared_variants.tsv" | tsv-uniq -H | tail -n +2 | sort)
  Argentina Japan USA United Kingdom
  $ echo $(tsv-select -H -f variant "$TMP/prepared_variants.tsv" | tsv-uniq -H | tail -n +2 | sort)
  19A 20A 20B 20C 20I (Alpha, V1) 21A (Delta) 21I (Delta) 21J (Delta) 21K (Omicron) 21L (Omicron) 21M (Omicron) recombinant
  $ echo $(tsv-select -H -f date "$TMP/prepared_variants.tsv" | tsv-uniq -H | tail -n +2 | sort | tsv-summarize --first 1 --last 1)
  2022-01-06 2022-01-10

Verify that the output case counts is a subset with expected locations and dates.

  $ wc -l < "$TMP/prepared_cases.tsv" | sed 's/^[[:space:]]*//'
  21
  $ echo $(tsv-select -H -f location "$TMP/prepared_cases.tsv" | tsv-uniq -H | tail -n +2 | sort)
  Argentina Japan USA United Kingdom
  $ echo $(tsv-select -H -f date "$TMP/prepared_cases.tsv" | tsv-uniq -H | tail -n +2 | sort | tsv-summarize --first 1 --last 1)
  2022-01-06 2022-01-10
