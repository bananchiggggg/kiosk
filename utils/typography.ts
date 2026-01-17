
/**
 * fitPlateText: Calculates the optimal font size for JetBrains Mono text
 * to fit within a specific container while maintaining safety margins.
 */

export interface FontFitOptions {
  containerWidth: number;
  containerHeight: number;
  textLength: number;
  isCompact: boolean;
}

export const fitPlateText = (options: FontFitOptions): number => {
  const { containerWidth, containerHeight, textLength, isCompact } = options;
  
  if (containerWidth === 0 || containerHeight === 0) return 48;

  // 1. Define Safety Constraints
  // padding-inline: clamp(16px, 2vw, 32px) -> using ~24px for calculation safety
  const horizontalPadding = containerWidth > 600 ? 32 : 24;
  const availableWidth = containerWidth - (horizontalPadding * 2);
  const availableHeight = containerHeight;

  // 2. JetBrains Mono Proportions
  // Monospaced fonts typically have a width-to-height ratio of approx 0.6
  // We use 0.62 to add a slight extra horizontal buffer
  const charWidthFactor = 0.62;

  // 3. Width-based sizing: fontSize * charWidthFactor * length <= availableWidth
  const fontSizeByWidth = availableWidth / (Math.max(textLength, 6) * charWidthFactor);

  // 4. Height-based sizing: Maintaining the requested 0.45 - 0.60 ratio
  // targetRatio = 0.55
  const fontSizeByHeight = availableHeight * 0.55;

  // 5. Apply Clamping and "Compact Mode" restrictions
  const minFontSize = 32;
  const maxFontSize = isCompact ? 80 : 110;

  let finalSize = Math.min(fontSizeByWidth, fontSizeByHeight);
  
  // Clamp the result
  finalSize = Math.max(minFontSize, Math.min(finalSize, maxFontSize));

  return Math.floor(finalSize);
};
