# Nextstrain logos

![Nextstrain](logo-portable.svg)

These vector logos were made in Inkscape from existing assets in use by Auspice and nextstrain.org.

The [circular tree](circular-tree.svg) was traced from [this bitmap](https://github.com/nextstrain/auspice/blob/71efbae68510b3c04c354a58339fe54d12f6c84c/docs/img/nextstrain.png) used in Auspice's documentation.
The resulting path was broken apart into the individual polygons and colored.
The original [trace](trace.svg) document has two stacked layers: one containing the bitmap and the other containing the trace.
This is handy for comparing the fidelity of the two by toggling layer visibility.

The [circular tree (white background variation)](circular-tree-white-background.svg) has a solid white circle behind the colored polygons for use in places where internal transparency is undesired (e.g. when used on top of dark backgrounds).

The [wordmark](wordmark.svg) was reproduced based on the font, weight, and colors used in the [nextstrain.org splash title](https://github.com/nextstrain/nextstrain.org/blob/1ecd072d2f8661d8cb82e252f43ffba3ac260b2d/static-site/src/components/splash/title.jsx).

The [portable wordmark](wordmark-portable.svg) and [portable logo](logo-portable.svg) have converted the text to paths so that the Lato font is not required for correct display.

For places that don't support SVGs, there are also high resolution (300 ppi) raster (PNG) versions of the [logo](logo.png), [circular tree](circular-tree.png) ([white background variant](circular-tree-white-background.png)), and [wordmark](wordmark.png).
These were generated with `cairosvg` using the commands in the [Makefile](Makefile).
You can regenerate them by running `make --jobs --always-make`.
