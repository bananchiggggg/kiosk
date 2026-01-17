
/**
 * TOP_VIEWPORTS: High-traffic device profiles based on GA4 export.
 * Used for automated screenshot testing and layout validation.
 */
export const TOP_VIEWPORTS = [
  { name: "Samsung Galaxy Tab S9 (Landscape)", width: 1600, height: 1000 },
  { name: "iPad Air (Portrait)", width: 820, height: 1180 },
  { name: "Generic Kiosk Wall Mount", width: 1920, height: 1080 },
  { name: "Zebra Rugged Tablet (Compact)", width: 1280, height: 800 },
  { name: "Mobile Guard Handheld", width: 390, height: 844 }
];

export const getKioskQAStatus = () => {
  const scrollH = document.documentElement.scrollHeight;
  const clientH = document.documentElement.clientHeight;
  const isClipped = scrollH > clientH + 5; // 5px tolerance for sub-pixel rendering
  
  return {
    isOneScreen: !isClipped,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  };
};
