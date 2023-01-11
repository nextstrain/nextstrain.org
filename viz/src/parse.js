import { variantColors, variantDisplayNames } from "./ncovSpecificSettings";

/** An "empty" data point.
 * Map used instead of object as it's (seemingly) faster + consumes less
 * memory (https://www.zhenghao.io/posts/object-vs-map)
 */
const TimePoint = new Map([
  ['date', undefined],
  ['freq', NaN],
  ['I_smooth', NaN],
  ['I_smooth_y0', NaN], // stacked
  ['I_smooth_y1', NaN], // stacked
  ['r_t', NaN],
]);
const VariantPoint = new Map([
  ['ga', undefined],
  ['temporal', undefined],
  ['variant', undefined],
])
const initialisePointsPerVariant = (variant, dates) => {
  const p = new Map(VariantPoint);
  p.set('variant', variant)
  p.set('temporal', dates.map((date) => {
    const tp = new Map(TimePoint);
    tp.set('date', date);
    return tp;
  }));
  return p;
}

const THRESHOLD_FREQ = 0.005; /* half a percent */
const INITIAL_DAY_CUTOFF = 10; /* cut off first 10 days */

/**
 * <returned_Object> ["points"] [location] [ variant ] [ dateIdx ] : Point
 *                   ["variants"] : list
 *                   ["dates"] : list
 *                   ["locations"] : list
 *                   ["dateIdx"] : Map (lookup for date string -> idx in dates array)
 *                   ["variantColors"] : Map
 *                   ["variantDisplayNames"] : Map
 *                   ["pivot"]: string
 */
export const parseModelData = (renewal, mlr) => {

  compareModels(renewal, mlr); // throws if inconsistent JSONs

  // Skip initial days of model estimates to avoid artifacts in plots
  const keep_dates = renewal.metadata.dates.slice(INITIAL_DAY_CUTOFF);
  const dateIdx = new Map(keep_dates.map((d, i) => [d, i]));

  const data = new Map([
    ["locations", renewal.metadata.location],
    ["variants", renewal.metadata.variants],
    ["dates", keep_dates],
    ["variantColors", variantColors],
    ["variantDisplayNames", variantDisplayNames],
    ["dateIdx", dateIdx],
    ["points", undefined],
    ["domains", undefined],
    // TODO: use the explicit pivot in the metadata instead of assuming the
    // pivot is the last variant in the array once it has been added to the evofr output
    ["pivot", mlr.metadata.variants[mlr.metadata.variants.length - 1]]
  ])

  let ga_min=100, ga_max=0;

  const points = new Map(
    data.get('locations').map((location) => [
      location,
      new Map(
        data.get('variants').map((variant) => [
          variant,
          initialisePointsPerVariant(variant, keep_dates)
        ])
      )
    ])
  );

  /* Iterate through each data element & assign to our structure */
  renewal.data
    .filter((d) => dateIdx.get(d.date) !== undefined) /* filter out skipped dates */
    .forEach((d) => {
      if (d.site==="R") {
        if (d.ps==="median") {
          points.get(d.location).get(d.variant).get('temporal')[dateIdx.get(d.date)].set('r_t', d.value);
        }
      }
      else if (d.site==="I_smooth") {
        if (d.ps==="median") {
          points.get(d.location).get(d.variant).get('temporal')[dateIdx.get(d.date)].set('I_smooth', d.value);
        }
      }
    });
  mlr.data
    .filter((d) => {
      // if data has a date, filter out skipped dates
      if (d.date) {
        return dateIdx.get(d.date) !== undefined;
      }
      return true;
    })
    .forEach((d) => {
      if (d.site==="freq") {
        if (d.ps==="median") {
          points.get(d.location).get(d.variant).get('temporal')[dateIdx.get(d.date)].set('freq', d.value);
        }
      } else if (d.site==="ga") {
        if (d.ps==="median") {
          points.get(d.location).get(d.variant).set('ga', d.value);
        } else if (d.ps==="HDI_80_lower") {
          points.get(d.location).get(d.variant).set('ga_HDI_95_lower', d.value);
        } else if (d.ps==="HDI_80_upper") {
          points.get(d.location).get(d.variant).set('ga_HDI_95_upper', d.value);
        }
      }
    });


  /* Once everything's been added (including frequencies) - iterate over each point & censor certain frequencies */
  let [nanCount, censorCount] = [0, 0];

  /**
   * for any timePoint where the frequency is either not provided (NaN) or
   * under our threshold, we don't want to use any model output for this date
   * (for the given variant, location))
   */
  const censorTimePoints = (point, idx, dateList) => {
    const freq = point.get('freq');
    if (isNaN(freq)) {
      dateList[idx] = new Map(TimePoint);
      nanCount++;
    } else if (freq<THRESHOLD_FREQ) {
      dateList[idx] = new Map(TimePoint);
      censorCount++;
    }
  }

  for (const variantMap of points.values()) {
    for (const variantPoint of variantMap.values()) {
      const dateList = variantPoint.get('temporal');
      dateList.forEach(censorTimePoints)
      // set non-temporal domains
      if (variantPoint.get('ga_HDI_95_lower')<ga_min) {
        ga_min = variantPoint.get('ga_HDI_95_lower');
      } else if (variantPoint.get('ga_HDI_95_upper')>ga_max) {
        ga_max = variantPoint.get('ga_HDI_95_upper')
      }
    }
  }

  /* create a stack for I_smooth to help with plotting - this could be in the previous set of
  loops but it's here for readability */
  for (const variantMap of points.values()) {
    let runningTotalPerDay = new Array(keep_dates.length).fill(0);
    for (const variantPoint of variantMap.values()) {
      const dateList = variantPoint.get('temporal');
      dateList.forEach((point, idx) => {
        point.set('I_smooth_y0', runningTotalPerDay[idx]);
        runningTotalPerDay[idx] += point.get('I_smooth') || 0; // I_smooth may be NaN
        point.set('I_smooth_y1', runningTotalPerDay[idx]);
      })
    }
  }

  data.set('domains', new Map([
    ['ga', [ga_min, ga_max]],
  ]));

  console.log(`Renewal model data`)
  console.log(`\t${renewal.metadata.location.length} locations x ${renewal.metadata.variants.length} variants x ${keep_dates.length} dates`)
  console.log(`\tNote: The earliest ${INITIAL_DAY_CUTOFF} days have been ignored`);
  console.log(`\t${censorCount} censored points as frequency<${THRESHOLD_FREQ}`);
  console.log(`\t${nanCount} points missing`);

  data.set("points", points);
  return data;
};


function compareModels(renewal, mlr) {
  let errMsg = ''
  for (const key of ['location', 'variants', 'dates']) {
    if (renewal.metadata[key].length!==mlr.metadata[key]) {
      const a = renewal.metadata[key].filter((x) => !mlr.metadata[key].includes(x));
      const b = mlr.metadata[key].filter((x) => !renewal.metadata[key].includes(x));
      if (a.length || b.length) {
        let msg = `Inconsistency between Renewal & MLR models for ${key}; values only in renewal model: ${a.join(", ")}, only in MRL model: ${b.join(", ")}. `
        if (key==="dates") {
          /* this is not terminal, and in fact is often the case! */
          msg += "Proceeding with the dates specified in the renewal model."
          console.log(msg)
        } else {
          errMsg += msg;
        }
      }
    }
  }
  if (errMsg) {
    throw new Error(errMsg);
  }
}
