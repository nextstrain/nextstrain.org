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

/**
 * <returned_Object> ["points"] [location] [ variant ] [ dateIdx ] : Point
 *                   ["variants"] : list
 *                   ["dates"] : list
 *                   ["locations"] : list
 *                   ["dateIdx"] : Map (lookup for date string -> idx in dates array)
 *                   ["variantColors"] : Map
 *                   ["variantDisplayNames"] : Map
 */
export const parseModelData = (renewal, mlr) => {

  compareModels(renewal, mlr); // throws if inconsistent JSONs

  const dateIdx = new Map(renewal.metadata.dates.map((d, i) => [d, i]));

  const data = new Map([
    ["locations", renewal.metadata.location],
    ["variants", renewal.metadata.variants],
    ["dates", renewal.metadata.dates],
    ["variantColors", variantColors],
    ["variantDisplayNames", variantDisplayNames],
    ["dateIdx", dateIdx],
    ["points", undefined],
    ["domains", undefined]
  ])

  let rt_min=100, rt_max=0, ga_min=100, ga_max=0;

  const points = new Map(
    data.get('locations').map((location) => [
      location,
      new Map(
        data.get('variants').map((variant) => [
          variant,
          initialisePointsPerVariant(variant, renewal.metadata.dates)
        ])
      )
    ])
  );

  /* Iterate through each data element & assign to our structure */
  renewal.data.forEach((d) => {
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
  })
  mlr.data.forEach((d) => {
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
  })

  /* Once everything's been added (including frequencies) - iterate over each point & censor certain frequencies */
  let [nanCount, censorCount] = [0, 0];
  for (const variantMap of points.values()) {
    for (const variantPoint of variantMap.values()) {
      const dateList = variantPoint.get('temporal');
      dateList.forEach((point, idx) => {
        const freq = point.get('freq');
        /* for any timePoint where the frequency is either not provided (NaN) or
        under our threshold, we don't want to use any model output for this date
        (for the given variant, location) */
        if (isNaN(freq)) {
          dateList[idx] = new Map(TimePoint);
          nanCount++;
        } else if (freq<THRESHOLD_FREQ) {
          dateList[idx] = new Map(TimePoint);
          censorCount++;
        // } else {
        //   // pt is valid -- inform domains
        //   const rt = point.get('r_t');
        //   if (rt<rt_min) {
        //     rt_min = rt;
        //   } else if (rt>rt_max) {
        //     rt_max = rt;
        //   } 
        }
      })
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
    let runningTotalPerDay = new Array(renewal.metadata.dates.length).fill(0);
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
    // ['rt', [rt_min, rt_max]],
    ['ga', [ga_min, ga_max]],
  ]));

  console.log(`Renewal model data`)
  console.log(`\t${renewal.metadata.location.length} locations x ${renewal.metadata.variants.length} variants x ${renewal.metadata.dates.length} dates`)
  console.log(`\t${censorCount} ensored points + ${nanCount} points missing`);

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