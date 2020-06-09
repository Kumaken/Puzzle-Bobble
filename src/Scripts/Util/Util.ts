export const getResolution = () => {
  let w = 720;
  let h = 1200;


  if (isTargetDevice() !== -1) {
    w = window.innerWidth * window.devicePixelRatio;
    h = window.innerHeight * window.devicePixelRatio;
 
  }
  return { width: w, height: h };
};

/**
 * Is not mobile return -1
 */
export const isMobile = () => {
  return navigator.userAgent.indexOf('Mobile');
};

/**
 * Is not tablet return -1
 */
export const isTablet = () => {
  return navigator.userAgent.indexOf('Tablet');
};

/**
 * Is not target device return -1
 */
export const isTargetDevice = () => {
  const mobile = isMobile();
  return mobile !== -1 ? mobile : isTablet();
};

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function isInApp(): boolean {
  return (
    navigator.userAgent.includes('Shopee') ||
    navigator.userAgent.includes('Beeshop')
  );
}

export const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search.substring(1));
  return Object.fromEntries(urlParams);
};
