"""
This part of the workflow handles Slack notifications.
"""

rule notify_on_clade_without_variant:
    input:
        clade_without_variant = "data/{data_provenance}/{geo_resolution}/clade_without_variant.txt"
    output:
        touch("data/{data_provenance}/{geo_resolution}/notify/clade_without_variant.done")
    shell:
        """
        ./bin/notify-on-clade-without-variant {input.clade_without_variant}
        """
