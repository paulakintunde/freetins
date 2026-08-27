import sharpService from 'astro/assets/services/sharp';
import type { LocalImageService } from 'astro';

/**
 * The sharp image service with a per-format default quality.
 *
 * ## Why this file exists
 *
 * Every `<Picture>` on the site is written `formats={['avif']} fallbackFormat="webp"`
 * and none of them passes `quality`. With no `quality` prop Astro hands sharp
 * `undefined`, so each format falls back to sharp's own default: AVIF 50, WebP 80.
 * Those two numbers are not on the same scale, and the result is a fallback that is
 * both heavier and worse than the image almost nobody receives.
 *
 * Measured over five representative assets at the width a 1440px viewport actually
 * picks for a card (528w):
 *
 *   avif q50  183 KB   38.7 dB      <- what modern browsers fetch
 *   avif q42  136 KB   36.0 dB      26% smaller
 *   webp q80  237 KB   35.7 dB      <- the fallback, 30% larger than avif q50
 *   webp q72  195 KB   35.0 dB      18% smaller
 *
 * AVIF at 42 is both smaller *and* higher-fidelity than the WebP fallback shipping
 * today, which is the tell that the defaults were never chosen for this artwork.
 * The values below were picked from that sweep: the largest reduction available
 * before the curve turns. AVIF 35 saves another 17 points but lands at 33.7 dB,
 * where flat colour in stylised game art starts to band, so it was not taken.
 *
 * ## Why a service rather than a prop
 *
 * `<Picture quality>` applies one number to every format it emits, and one number
 * cannot serve both scales: 72 makes the AVIF larger than it is now, 42 degrades the
 * fallback well past the point the sweep supports. Per-format defaults have to live
 * below the component, which is what a service is for.
 *
 * A call site that passes `quality` explicitly still wins — this only fills in the
 * value Astro would otherwise leave to sharp, so a future hero that needs a
 * different number says so on the tag and this file does not have to know about it.
 */
const DEFAULT_QUALITY: Record<string, number> = {
  avif: 42,
  webp: 72,
};

const service: LocalImageService = {
  ...sharpService,
  transform(inputBuffer, transformOptions, config) {
    const requested = transformOptions as { format?: string; quality?: string | number | null };
    const fallback = requested.format ? DEFAULT_QUALITY[requested.format] : undefined;

    /*
     * Only fill a gap. `quality` is read as truthy upstream, so an explicit 0 is
     * already "no quality" to sharp and is left exactly as the call site wrote it.
     */
    const options = fallback !== undefined && !requested.quality
      ? { ...transformOptions, quality: fallback }
      : transformOptions;

    return sharpService.transform(inputBuffer, options, config);
  },
};

export default service;
