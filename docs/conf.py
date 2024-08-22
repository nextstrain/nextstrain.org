"""
Configuration file for the Sphinx documentation builder.

See <https://www.sphinx-doc.org/en/master/usage/configuration.html>.
"""

project = 'nextstrain.org'
copyright = 'Trevor Bedford and Richard Neher'
author = 'The Nextstrain Team'

primary_domain = 'js'
highlight_language = 'js'

default_role = 'literal'

html_theme = 'nextstrain-sphinx-theme'

extensions = [
    'recommonmark',
    'sphinx_markdown_tables',
    'sphinx.ext.intersphinx',
    'nextstrain.sphinx.theme',
]

intersphinx_mapping = {
    'docs': ('https://docs.nextstrain.org/page/', None),
    'cli': ('https://docs.nextstrain.org/projects/cli/page/', None),
}
