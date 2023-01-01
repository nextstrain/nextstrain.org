"""
This part of the workflow downloads and prepares the data necessary to run models
"""

rule download_case_counts:
    output:
        cases = "data/cases/{geo_resolution}.tsv.gz"
    params:
        cases_url = "https://data.nextstrain.org/files/workflows/forecasts-ncov/cases/{geo_resolution}.tsv.gz"
    shell:
        """
        curl -fsSL --compressed {params.cases_url:q} --output {output.cases}
        """

rule download_clade_counts:
    output:
        clades = "data/{data_provenance}/nextstrain_clades/{geo_resolution}.tsv.gz"
    params:
        clades_url = "https://data.nextstrain.org/files/workflows/forecasts-ncov/{data_provenance}/nextstrain_clades/{geo_resolution}.tsv.gz"
    shell:
        """
        curl -fsSL --compressed {params.clades_url:q} --output {output.clades}
        """

def _get_prepare_data_option(wildcards, option_name):
    """
    Return the option for prepare data from the config based on the
    wildcards.data_provenance and the wildcards.geo_resolution values.

    If the *option* exists as a key within config['prepare_data'][wildcard.data_provenance][wildcard.geo_resolution]
    then return as "--{option-name} {option_value}". Or else return an empty string.
    """
    option_value = config.get('prepare_data', {}) \
                         .get(wildcards.data_provenance, {}) \
                         .get(wildcards.geo_resolution, {}) \
                         .get(option_name)

    if option_value is not None:
        # Change underscores of YAML keys to dashes for proper CLI option names
        option_name = option_name.replace('_', '-')
        return f'--{option_name} {option_value}'

    return ''


rule prepare_data:
    message: "Preparing counts data for analysis"
    input:
        cases = "data/cases/{geo_resolution}.tsv.gz",
        nextstrain_clades = "data/{data_provenance}/nextstrain_clades/{geo_resolution}.tsv.gz"
    output:
        clade_without_variant = "data/{data_provenance}/{geo_resolution}/clade_without_variant.txt",
        cases = "data/{data_provenance}/{geo_resolution}/prepared_cases.tsv",
        variants = "data/{data_provenance}/{geo_resolution}/prepared_variants.tsv"
    log:
        "logs/{data_provenance}/{geo_resolution}/prepare_data.txt"
    params:
        max_date = lambda wildcards: _get_prepare_data_option(wildcards, 'max_date'),
        included_days = lambda wildcards: _get_prepare_data_option(wildcards, 'included_days'),
        location_min_seq = lambda wildcards: _get_prepare_data_option(wildcards, 'location_min_seq'),
        location_min_seq_days = lambda wildcards: _get_prepare_data_option(wildcards, 'location_min_seq_days'),
        excluded_locations = lambda wildcards: _get_prepare_data_option(wildcards, 'excluded_locations'),
        prune_seq_days = lambda wildcards: _get_prepare_data_option(wildcards, 'prune_seq_days'),
        clade_min_seq = lambda wildcards: _get_prepare_data_option(wildcards, 'clade_min_seq'),
        clade_min_seq_days = lambda wildcards: _get_prepare_data_option(wildcards, 'clade_min_seq_days'),
        clade_to_variant = lambda wildcards: _get_prepare_data_option(wildcards, 'clade_to_variant'),
        force_include_clades = lambda wildcards: _get_prepare_data_option(wildcards, 'force_include_clades'),
    shell:
        """
        python ./scripts/prepare-data.py \
            --clades {input.nextstrain_clades} \
            --cases {input.cases} \
            {params.max_date} \
            {params.included_days} \
            {params.location_min_seq} \
            {params.location_min_seq_days} \
            {params.excluded_locations} \
            {params.prune_seq_days} \
            {params.clade_min_seq} \
            {params.clade_min_seq_days} \
            {params.clade_to_variant} \
            {params.force_include_clades} \
            --output-clade-without-variant {output.clade_without_variant} \
            --output-variants {output.variants} \
            --output-cases {output.cases} 2>&1 | tee {log}
        """
