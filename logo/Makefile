rasters: logo.png wordmark.png circular-tree.png circular-tree-white-background.png

# Use the portable versions for logos with text to avoid font availability issues.
logo.png wordmark.png: %.png: %-portable.svg
	cairosvg --dpi 300 --format png --output $@ $<

circular-tree.png circular-tree-white-background.png: %.png: %.svg
	cairosvg --dpi 300 --format png --output $@ $<
