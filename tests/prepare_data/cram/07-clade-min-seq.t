Setup

  $ pushd "$TESTDIR" > /dev/null

Prepared data with the max date 2022-01-10, which is the last date of the test data.
Only include 5 days in analysis.
Prune the sequences in last day of clade counts.
Require a location to have a minimum of 5000 sequences in the last 2 days.
Exclude specific locations.
Collapse clades that have less than 50 sequences into 'other'.
The outputs should be subsets of the clade counts and case counts.

  $ python3 ../../../scripts/prepare-data.py \
  > --clades ../data/nextstrain_clades.tsv \
  > --cases ../data/cases.tsv \
  > --max-date 2022-01-10 \
  > --included-days 5 \
  > --prune-seq-days 1 \
  > --location-min-seq 5000 \
  > --location-min-seq-days 2 \
  > --excluded-locations ../data/excluded_locations.txt \
  > --clade-min-seq 50 \
  > --clade-to-variant ../data/clade_to_variant.tsv \
  > --output-variants "$TMP/prepared_variants.tsv" \
  > --output-cases "$TMP/prepared_cases.tsv"
  Setting max date (inclusive) as '2022-01-10'.
  Setting min date (inclusive) as '2022-01-06'.
  Only including locations that have at least 5000 sequence(s) in the last 2 days of the analysis date range.
  Excluding the following requested locations: ['Japan', 'United Kingdom'].
  Locations that will be included: ['USA'].
  Collapsing clades that have less than 50 sequence(s) in the analysis date range (inclusive) into a single 'other' variant.
  Pruning variants counts in the last 1 day(s) to exclude recent dates that may be overly enriched for variants.
  Variants that will be included: ['19A', '21J (Delta)', '21K (Omicron)', '21L (Omicron)', 'other'].

Verify that the output clade counts is a subset with expected locations, clades, and dates.

  $ wc -l < "$TMP/prepared_variants.tsv" | sed 's/^[[:space:]]*//'
  21
  $ echo $(tsv-select -H -f location "$TMP/prepared_variants.tsv" | tsv-uniq -H | tail -n +2 | sort)
  USA
  $ echo $(tsv-select -H -f variant "$TMP/prepared_variants.tsv" | tsv-uniq -H | tail -n +2 | sort)
  19A 21J (Delta) 21K (Omicron) 21L (Omicron) other
  $ echo $(tsv-select -H -f date "$TMP/prepared_variants.tsv" | tsv-uniq -H | tail -n +2 | sort | tsv-summarize --first 1 --last 1)
  2022-01-06 2022-01-09


Verify that the output case counts is a subset with expected locations and dates.

  $ wc -l < "$TMP/prepared_cases.tsv" | sed 's/^[[:space:]]*//'
  6
  $ echo $(tsv-select -H -f location "$TMP/prepared_cases.tsv" | tsv-uniq -H | tail -n +2 | sort)
  USA
  $ echo $(tsv-select -H -f date "$TMP/prepared_cases.tsv" | tsv-uniq -H | tail -n +2 | sort | tsv-summarize --first 1 --last 1)
  2022-01-06 2022-01-10

