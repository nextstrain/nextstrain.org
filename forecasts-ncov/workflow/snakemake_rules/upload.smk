"""
This part of the workflow handles uploading files to specific locations.

Uses predefined wildcards `data_provenance`,`geo_resolution`, `model`, and `date`
to determine inputs and upload destination.

Produces output files as `results/{data_provenance}/{geo_resolution}/{model}/{date}*upload.done`.

Currently only supports uploads to AWS S3, but additional upload rules can
be easily added as long as they follow the output pattern described above.
"""
import os
import yaml

slack_envvars_defined = "SLACK_CHANNELS" in os.environ and "SLACK_TOKEN" in os.environ
send_notifications = (
    config.get("send_slack_notifications", False) and slack_envvars_defined
)

rule upload_model_results_to_s3:
    input:
        model_results = "results/{data_provenance}/{geo_resolution}/{model}/{date}_results.json"
    output:
        touch("results/{data_provenance}/{geo_resolution}/{model}/{date}_results_s3_upload.done")
    params:
        quiet="" if send_notifications else "--quiet",
        s3_dst=lambda wildcards: config["upload"].get(wildcards.data_provenance, {}).get("s3_dst", ""),
    shell:
        """
        ./bin/nextstrain-remote-upload-with-slack-notification \
            {params.quiet} \
            {params.s3_dst:q}/nextstrain_clades/{wildcards.geo_resolution:q}/{wildcards.model:q}/ \
            {input.model_results}
        """

rule copy_dated_model_results_to_latest:
    input:
        dated_model_results = "results/{data_provenance}/{geo_resolution}/{model}/{date}_results.json"
    output:
        latest_model_results = "results/{data_provenance}/{geo_resolution}/{model}/{date}/latest_results.json"
    shell:
        """
        cp {input.dated_model_results} {output.latest_model_results}
        """

rule upload_model_results_to_s3_as_latest:
    input:
        model_results = "results/{data_provenance}/{geo_resolution}/{model}/{date}/latest_results.json"
    output:
        touch("results/{data_provenance}/{geo_resolution}/{model}/{date}_latest_results_s3_upload.done")
    params:
        quiet="" if send_notifications else "--quiet",
        s3_dst=lambda wildcards: config["upload"].get(wildcards.data_provenance, {}).get("s3_dst", ""),
    shell:
        """
        ./bin/nextstrain-remote-upload-with-slack-notification \
            {params.quiet} \
            {params.s3_dst:q}/nextstrain_clades/{wildcards.geo_resolution:q}/{wildcards.model:q}/ \
            {input.model_results}
        """
