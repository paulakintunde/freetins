# Legacy blog image record

## Rights basis

Fourteen restored article images are original Freetins instructional diagrams
generated locally by `scripts/generate-restoration-art.mjs`. They contain no copied
screenshots, creator artwork, product logos, watermarks, or third-party interface
assets. Freetins may publish, crop, and resize these files.

The diagrams are intentionally labeled "Original instructional diagram" so readers
do not interpret them as evidence of a product installation or a current product
interface. Article text and captions must retain that distinction.

## Output

Each source definition produces:

- `src/assets/articles/<slug>-article-art.webp` at 1536 by 1024 pixels for responsive article display.
- `public/og/articles/<slug>.jpg` at 1200 by 630 pixels for social previews.

## Product captures

Actual product screenshots remain optional supporting figures. Add one only after
recording the capture environment, source URL or owned installation, creator,
license or editorial-use basis, caption, alt text, and any redaction performed.
Never replace an instructional diagram with an unrecorded downloaded image.

The coding counter image is a real capture of the Freetins-owned example at
`public/examples/click-counter/index.html`. The retained source is
`src/assets/article-sources/coding-browser-click-counter-capture.png`. It was
captured at count zero after the automated behavior test passed. No personal data,
account information, or third-party interface appears in the capture.
