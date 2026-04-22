(function () {
  const root = document.documentElement;
  const body = document.body;
  const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
  const sections = Array.from(document.querySelectorAll("[data-slide]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.add("js");

  function markAllVisible() {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  function setActiveSlide(slideId) {
    if (slideId) {
      body.dataset.activeSlide = slideId;
    }
  }

  async function waitForAssets() {
    const imageLoads = Array.from(document.images).map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });

    await Promise.all(imageLoads);

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  }

  function createRevealObserver() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      markAllVisible();
      return;
    }

    root.classList.add("has-motion");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.18
      }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  function createSectionObserver() {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSlide(visible.target.dataset.slide);
        }
      },
      {
        rootMargin: "-20% 0px -35% 0px",
        threshold: [0.2, 0.45, 0.7]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  function enableExportMode() {
    root.classList.add("is-exporting");
    markAllVisible();
  }

  function disableExportMode() {
    root.classList.remove("is-exporting");
  }

  window.addEventListener("beforeprint", enableExportMode);
  window.addEventListener("afterprint", disableExportMode);
  window.__presentationExport = {
    prepare() {
      enableExportMode();
      root.dataset.ready = "true";
    }
  };

  waitForAssets()
    .then(() => {
      createRevealObserver();
      createSectionObserver();
      setActiveSlide(sections[0] && sections[0].dataset.slide);
      requestAnimationFrame(() => {
        root.dataset.ready = "true";
      });
    })
    .catch(() => {
      markAllVisible();
      root.dataset.ready = "true";
    });
})();
