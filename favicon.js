const faviconLink =
  document.querySelector('link[rel="icon"]') ||
  document.querySelector('link[rel="shortcut icon"]');

if (faviconLink) {
  const eyeCenter = { x: 32, y: 32 };
  const pupilRadius = 7.5;
  const maxOffset = 5;
  let pupilPosition = { ...eyeCenter };
  let isBlinking = false;
  let blinkTimeoutId;
  let renderFrameId = 0;

  const svgToDataUri = (svg) =>
    `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

  const buildOpenEye = (pupilX, pupilY) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <ellipse cx="32" cy="32" rx="22" ry="17" fill="#ffffff" />
        <circle cx="${pupilX}" cy="${pupilY}" r="${pupilRadius}" fill="#1f2328" />
      </svg>
    `;

    return svgToDataUri(svg);
  };

  const buildClosedEye = () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="none" />
        <line
          x1="14"
          y1="32"
          x2="50"
          y2="32"
          stroke="#ffffff"
          stroke-width="13"
          stroke-linecap="round"
        />
      </svg>
    `;

    return svgToDataUri(svg);
  };

  const closedEye = buildClosedEye();
  const renderOpenEye = () => {
    faviconLink.href = buildOpenEye(pupilPosition.x, pupilPosition.y);
  };

  const requestRender = () => {
    if (isBlinking || renderFrameId) {
      return;
    }

    renderFrameId = window.requestAnimationFrame(() => {
      renderFrameId = 0;
      renderOpenEye();
    });
  };

  const updatePupilPosition = (clientX, clientY) => {
    const dx = clientX - window.innerWidth / 2;
    const dy = clientY - window.innerHeight / 2;
    const distance = Math.hypot(dx, dy) || 1;
    const scale = Math.min(maxOffset, distance) / distance;

    pupilPosition = {
      x: Number((eyeCenter.x + dx * scale).toFixed(2)),
      y: Number((Math.max(eyeCenter.y, eyeCenter.y + dy * scale)).toFixed(2)),
    };

    requestRender();
  };

  const blink = () => {
    isBlinking = true;
    faviconLink.href = closedEye;

    window.setTimeout(() => {
      isBlinking = false;
      renderOpenEye();
      scheduleNextBlink();
    }, 130 + Math.floor(Math.random() * 90));
  };

  const scheduleNextBlink = () => {
    const nextBlinkIn = 2200 + Math.floor(Math.random() * 3400);
    blinkTimeoutId = window.setTimeout(blink, nextBlinkIn);
  };

  window.addEventListener("mousemove", (event) => {
    updatePupilPosition(event.clientX, event.clientY);
  });

  window.addEventListener("mouseleave", () => {
    pupilPosition = { ...eyeCenter };
    requestRender();
  });

  renderOpenEye();
  scheduleNextBlink();
}
