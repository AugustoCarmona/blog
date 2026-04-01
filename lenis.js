document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const hero = document.querySelector(".hero");
  const nav = document.querySelector(".section-nav");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const setRootVar = (name, value) => root.style.setProperty(name, value);

  const revealTargets = [
    ...document.querySelectorAll(
      ".hero, .quote, .page-header, .section, .entry, .job, .project-detail, .footer"
    ),
  ];

  revealTargets.forEach((target, index) => {
    target.classList.add("motion-target");
    target.style.setProperty("--reveal-order", String(index % 4));
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    body.classList.add("js-motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const samePageSectionLinks = nav
    ? [...nav.querySelectorAll("a[href]")]
        .map((link) => ({
          link,
          url: new URL(link.getAttribute("href"), window.location.href),
        }))
        .filter(
          ({ url }) => url.pathname === window.location.pathname && url.hash
        )
        .map(({ link, url }) => {
          const section = document.querySelector(url.hash);

          if (!section) {
            return null;
          }

          return {
            id: section.id,
            link,
            section,
          };
        })
        .filter(Boolean)
    : [];

  if (nav) {
    [...nav.querySelectorAll("a[href]")]
      .filter((link) => {
        const url = new URL(link.getAttribute("href"), window.location.href);
        return url.pathname === window.location.pathname && !url.hash;
      })
      .forEach((link) => link.classList.add("is-current"));
  }

  const setCurrentSectionLink = (activeId) => {
    samePageSectionLinks.forEach(({ id, link }) => {
      link.classList.toggle("is-current", id === activeId);
    });
  };

  const updateCurrentSection = () => {
    if (!samePageSectionLinks.length) {
      return;
    }

    const pivot = window.innerHeight * 0.38;
    let activeId = samePageSectionLinks[0].id;

    samePageSectionLinks.forEach(({ id, section }) => {
      if (section.getBoundingClientRect().top <= pivot) {
        activeId = id;
      }
    });

    setCurrentSectionLink(activeId);
  };

  const updateScrollState = (scrollPosition = window.scrollY) => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const scrollProgress = clamp(scrollPosition / maxScroll, 0, 1);

    setRootVar("--scroll-progress", scrollProgress.toFixed(4));
    body.classList.toggle("is-scrolled", scrollPosition > 24);

    if (hero) {
      const heroRect = hero.getBoundingClientRect();
      const heroProgress = clamp(
        (window.innerHeight - heroRect.top) / (heroRect.height + window.innerHeight),
        0,
        1
      );

      setRootVar("--hero-copy-shift", `${Math.round(heroProgress * -18)}px`);
      setRootVar("--portrait-shift", `${Math.round(heroProgress * 28)}px`);
      setRootVar("--portrait-scale", (1 + heroProgress * 0.03).toFixed(3));
    }

    updateCurrentSection();
  };

  const handleNativeScroll = () => updateScrollState(window.scrollY);

  if (typeof window.Lenis === "function" && !prefersReducedMotion) {
    const lenis = new window.Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      lerp: 0.08,
    });

    lenis.on("scroll", ({ scroll }) => updateScrollState(scroll));
    window.lenis = lenis;
  } else {
    window.addEventListener("scroll", handleNativeScroll, { passive: true });
  }

  window.addEventListener("resize", () => updateScrollState(window.scrollY), {
    passive: true,
  });

  updateScrollState(window.scrollY);
});
