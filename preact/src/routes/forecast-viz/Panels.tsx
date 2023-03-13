import {h} from 'preact';
import {PanelDisplay, useModelData} from 'nextstrain-forecasts-viz';

export const Panels = () => {

  const {modelData} = useModelData();
  if (!modelData) {
    /* not loaded, or an error etc */
    return null;
  }
  
  return (
    <div id="mainPanelsContainer" >

      <div className="div">
        {`Estimated Variant Frequencies over time`}
      </div>
      <div className="panelAbstract">
        {`These estimates are derived from sequence count data using a multinomial logistic regression model.`}
      </div>

      <PanelDisplay graphType="freq"/>

      <div className="div">
        {`Growth Advantage`}
      </div>
      <div className="panelAbstract">
        {`
          These plots show the estimated growth advantage for given variants relative to ${modelData.get("variantDisplayNames").get(modelData.get("pivot")) || "baseline"}.
          This is an estimate of how many more secondary infections this variant causes on average compared the baseline variant as estimated but the multinomial logistic regression model.
          Vertical bars show the 95% HPD.
        `}
      </div>
      <PanelDisplay graphType="ga"/>

      <div className="div">
        {`Estimated Cases over time`}
      </div>
      <div className="panelAbstract">
        {`As estimated by the variant renewal model.
        These estimates are smoothed to deal with daily reporting noise and weekend effects present in case data.`}
      </div>
      <PanelDisplay graphType="stackedIncidence"/>


      <div className="div">
        {`Estimated effective reproduction number over time`}
      </div>
      <div className="panelAbstract">
        {`This is an estimate of the average number of secondary infections expected to be caused by an individual infected with a given variant as estimated by the variant renewal model.
        In general, we expect the variant to be growing if this number is greater than 1.`}
      </div>
      <PanelDisplay graphType="r_t"/>

    </div>
  )
}
