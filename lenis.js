document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.Lenis !== "function") {
    return;
  }

  const lenis = new window.Lenis({
    autoRaf: true,
    anchors: true,
    smoothWheel: true,
    lerp: 0.08,
  });

  window.lenis = lenis;
});
