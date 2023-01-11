"""
This part of the workflow triggers downstream GitHub Action workflows.
"""

rule trigger_static_model_viz:
    input:
        latest_renewal_upload_flag = "results/gisaid/global/renewal/{date}_latest_results_s3_upload.done",
        latest_mlr_upload_flag = "results/gisaid/global/mlr/{date}_latest_results_s3_upload.done",
    output:
        touch("results/gisaid/global/{date}_trigger_static_model_viz.done")
    shell:
        """
        ./bin/trigger forecasts-ncov static-model-viz
        """

