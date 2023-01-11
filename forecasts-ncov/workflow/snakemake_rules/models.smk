"""
This part of the workflow runs the model scripts.
"""

rule renewal_model:
    input:
        cases = "data/{data_provenance}/{geo_resolution}/prepared_cases.tsv",
        variants = "data/{data_provenance}/{geo_resolution}/prepared_variants.tsv"
    output:
        # Note this output is not used in the shell command because it is one of the many
        # files generated and output to the export path.
        # We are listing this specific file as the output file because it is the final
        # final output of the model script.
        results = "results/{data_provenance}/{geo_resolution}/renewal/{date}_results.json"
    log:
        "logs/{data_provenance}/{geo_resolution}/renewal/{date}.txt"
    benchmark:
        "benchmarks/{data_provenance}/{geo_resolution}/renewal/{date}.txt"
    params:
        renewal_config = config.get("renewal_config"),
        export_path = lambda w: f"results/{w.data_provenance}/{w.geo_resolution}/renewal"
    resources:
        mem_mb=4000
    shell:
        """
        python -u ./scripts/run-renewal-model.py \
            --config {params.renewal_config} \
            --case-path {input.cases} \
            --seq-path {input.variants} \
            --export-path {params.export_path} \
            --data-name {wildcards.date} 2>&1 | tee {log}
        """


rule mlr_model:
    input:
        variants = "data/{data_provenance}/{geo_resolution}/prepared_variants.tsv"
    output:
        # Note this output is not used in the shell command because it is one of the many
        # files generated and output to the export path.
        # We are listing this specific file as the output file because it is the final
        # final output of the model script.
        results = "results/{data_provenance}/{geo_resolution}/mlr/{date}_results.json"
    log:
        "logs/{data_provenance}/{geo_resolution}/mlr/{date}.txt"
    benchmark:
        "benchmarks/{data_provenance}/{geo_resolution}/mlr/{date}.txt"
    params:
        renewal_config = config.get("mlr_config"),
        export_path = lambda w: f"results/{w.data_provenance}/{w.geo_resolution}/mlr"
    resources:
        mem_mb=4000
    shell:
        """
        python -u ./scripts/run-mlr-model.py \
            --config {params.renewal_config} \
            --seq-path {input.variants} \
            --export-path {params.export_path} \
            --data-name {wildcards.date} 2>&1 | tee {log}
        """
