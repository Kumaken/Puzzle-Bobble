export const getResolution = () => {
  
    let isMobile = navigator.userAgent.indexOf("Mobile");
      if (isMobile == -1) {
          isMobile = navigator.userAgent.indexOf("Tablet");
      }
      let w = 720;
      let h = 1200;
      if (isMobile !== -1) {
          w = window.innerWidth;
          h = window.innerHeight;
      }
  
    return { width: w, height: h };
  };

  