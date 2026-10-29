
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // 1. SCROLL PROGRESS & BACK-TO-TOP BUTTON
  // ==========================================
  const progress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const header = document.querySelector(".header");

  function updateScroll() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    const percent =
      scrollable > 0
        ? (window.scrollY / scrollable) * 100
        : 0;

    if (progress) {
      progress.style.width = `${percent}%`;
    }

    if (backToTop) {
      backToTop.classList.toggle("visible", window.scrollY > 450);
    }

    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 30);
    }
  }

  window.addEventListener("scroll", updateScroll, {
    passive: true
  });

  updateScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });


  // ==========================================
  // 2. ANIMATED NUMBER COUNTERS
  // ==========================================
  const counters = document.querySelectorAll(".counter");

  function animateCounter(counter) {
    if (counter.dataset.animated === "true") return;

    const target = Number(counter.dataset.target);

    if (!Number.isFinite(target)) return;

    counter.dataset.animated = "true";

    const duration = 1400;
    const start = performance.now();

    function updateCounter(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      counter.textContent = Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach(animateCounter);
  }

  // ==========================================
  // 3. PORTFOLIO CATEGORY FILTERS
  // ==========================================
  
  const filterButtons = document.querySelectorAll(
    ".portfolio-filters .filter-btn"
  );

  const portfolioCards = document.querySelectorAll(
    ".portfolio-grid .portfolio-card[data-category]"
  );

  function filterPortfolio(filter) {
    portfolioCards.forEach(card => {
      const matches =
        filter === "all" || card.dataset.category === filter;

      card.classList.toggle("is-hidden", !matches);
    });

    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  filterButtons.forEach(button => {
    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active"))
    );

    button.addEventListener("click", () => {
      filterPortfolio(button.dataset.filter || "all");
    });
  });


  // ==========================================
  // 4. REVEAL ELEMENTS ON SCROLL
  // ==========================================
  const revealTargets = document.querySelectorAll(
    ".about-content, .about-image, .service-card, " +
    ".portfolio-card, .why-item, .faq-item, .contact-form"
  );

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    "IntersectionObserver" in window &&
    !prefersReducedMotion
  ) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(element => {
      element.classList.add("reveal");
      revealObserver.observe(element);
    });
  } else {
    revealTargets.forEach(element => {
      element.classList.add("visible");
    });
  }


  // ==========================================
  // 5. MOBILE NAVIGATION
  // ==========================================
  // Shared navigation is managed by Bootstrap.

  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });


  // ==========================================
  // 8. CONTACT FORM VALIDATION
  // ==========================================
  const contactForm = document.querySelector(".contact-form");

  contactForm?.addEventListener("submit", event => {
    if (!contactForm.checkValidity()) {
      event.preventDefault();
      contactForm.reportValidity();
    }
  });


  // ==========================================
  // 9. HERO BACKGROUND SLIDER
  // ==========================================
  const heroSlides = document.querySelectorAll("#home .hero-bg");

  if (heroSlides.length > 0) {
    let slideIndex = 0;

    heroSlides.forEach((slide, index) => {
      slide.classList.toggle("active", index === 0);
    });

    if (
      heroSlides.length > 1 &&
      !prefersReducedMotion
    ) {
      setInterval(() => {
        heroSlides[slideIndex].classList.remove("active");

        slideIndex = (slideIndex + 1) % heroSlides.length;

        heroSlides[slideIndex].classList.add("active");
      }, 5000);
    }
  }


  // ==========================================
  // 10. PORTFOLIO PROJECT DETAILS
  // ==========================================
  const projectDetails = document.querySelectorAll(
    ".portfolio .project-details"
  );

  projectDetails.forEach(detail => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;

      projectDetails.forEach(other => {
        if (other !== detail) {
          other.open = false;
        }
      });
    });
  });


  // ==========================================
  // 11. NAVIGATION TO SPECIFIC PROJECTS
  // ==========================================
  const projectLinks = document.querySelectorAll(
    ".nav-dropdown-menu a, .dropdown-menu a"
  );

  projectLinks.forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");

      if (!targetId || !targetId.startsWith("#")) return;

      let target;

      try {
        target = document.querySelector(targetId);
      } catch {
        return;
      }

      if (!target) return;

      // Reset the portfolio filter.
      filterPortfolio("all");

      // Clear inline display values left by older scripts.
      document.querySelectorAll(".portfolio-card").forEach(card => {
        card.style.removeProperty("display");
      });

      // Navigate to the requested project.
      event.preventDefault();

      history.replaceState(null, "", targetId);

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });


  // ==========================================
  // 12. ANIMATED DETAILED SERVICE CARDS
  // ==========================================
  const serviceCards = document.querySelectorAll(
    ".detailed-services .detail-card"
  );

  if (
    serviceCards.length > 0 &&
    "IntersectionObserver" in window &&
    !prefersReducedMotion
  ) {
    serviceCards.forEach((card, index) => {
      card.classList.add("service-reveal");
      card.style.transitionDelay = `${(index % 3) * 100}ms`;
    });

    const serviceObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    serviceCards.forEach(card => {
      serviceObserver.observe(card);
    });
  } else {
    serviceCards.forEach(card => {
      card.classList.add("is-visible");
    });
  }

/* ==========================================
   GLOBAL ADVERTISING MEDIA
   INTERACTIVE ANIMATIONS
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ========================================
     1. SCROLL REVEAL ANIMATIONS
  ======================================== */

  const revealSelectors = [
    ".section-heading",
    ".about-image",
    ".about-content",
    ".service-card",
    ".detail-card",
    ".portfolio-heading",
    ".portfolio-card",
    ".why-list",
    ".why-description",
    ".why-item",
    ".testimonial-content",
    ".faq-heading",
    ".faq-item",
    ".contact-content",
    ".contact-form",
    ".footer-cta",
    ".footer-main",
    ".result-card",
    ".featured-image",
    ".featured-content",
    ".process-card",
    ".channels-intro",
    ".channel-card",
    ".testimonial-card",
    ".brief-content",
    ".brief-form",
    ".insight-card"
  ];

  const revealElements = [
    ...new Set(
      revealSelectors.flatMap(selector =>
        document.querySelectorAll(selector)
      )
    )
  ];

  document.documentElement.classList.add("js-motion");

  revealElements.forEach(element => {
    element.classList.add("reveal");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }


  /* ========================================
     2. STAGGERED CARD ANIMATIONS
  ======================================== */

  const staggerGroups = [
    ".service-grid",
    ".portfolio-grid",
    ".process-grid",
    ".results-grid",
    ".channels-grid",
    ".testimonial-grid",
    ".insights-grid"
  ];

  staggerGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach(group => {
      const cards = [...group.children].filter(card =>
        card.matches(
          ".service-card, .portfolio-card, .process-card, " +
          ".result-card, .channel-card, .testimonial-card, .insight-card"
        )
      );

      cards.forEach((card, index) => {
        card.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 4, 3) * 100}ms`
        );
      });
    });
  });


  /* ========================================
     3. ANIMATED STATISTICS COUNTERS
  ======================================== */

  const counters = document.querySelectorAll(".counter");

  function animateCounter(counter) {
    if (counter.dataset.counted === "true") return;

    counter.dataset.counted = "true";

    const target = Number(counter.dataset.target);

    if (!Number.isFinite(target)) return;

    const duration = 1600;
    const startTime = performance.now();

    function updateCounter(now) {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      // Smooth ease-out animation
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(target * eased);

      counter.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    }

    if (reduceMotion) {
      counter.textContent = target.toLocaleString();
    } else {
      requestAnimationFrame(updateCounter);
    }
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
  } else {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }


  /* ========================================
     4. SCROLL PROGRESS BAR
  ======================================== */

  const progressBar = document.getElementById("scrollProgress");
  let scrollTicking = false;

  function updateScrollProgress() {
    if (!progressBar) return;

    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const scrollPosition =
      window.scrollY || document.documentElement.scrollTop;

    const progress = scrollableHeight > 0
      ? Math.min(100, Math.max(0, scrollPosition / scrollableHeight * 100))
      : 0;

    progressBar.style.width = `${progress}%`;
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateScrollProgress);
      }
    },
    { passive: true }
  );

  updateScrollProgress();

  
  const heroSlides = [
    ...document.querySelectorAll(".hero-bg-slider .hero-bg")
  ];

  if (heroSlides.length > 1 && !reduceMotion) {
    let activeIndex = heroSlides.findIndex(slide =>
      slide.classList.contains("active")
    );

    if (activeIndex < 0) activeIndex = 0;

    heroSlides.forEach((slide, index) => {
      slide.classList.toggle("active", index === activeIndex);
    });

    let sliderInterval;

    function startSlider() {
      if (document.hidden || sliderInterval) return;

      sliderInterval = window.setInterval(() => {
        heroSlides[activeIndex].classList.remove("active");

        activeIndex = (activeIndex + 1) % heroSlides.length;

        heroSlides[activeIndex].classList.add("active");
      }, 6000);
    }

    function stopSlider() {
      if (sliderInterval) {
        window.clearInterval(sliderInterval);
        sliderInterval = undefined;
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopSlider();
      } else {
        startSlider();
      }
    });

    startSlider();
  }


  /* ========================================
     6. PORTFOLIO FILTERS
     Keeps your existing data-filter HTML.
  ======================================== */

  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioCards = document.querySelectorAll(
    ".portfolio-grid .portfolio-card"
  );

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(item => {
        const isActive = item === button;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      portfolioCards.forEach(card => {
        const categories = (card.dataset.category || "").split(/\s+/);
        const showCard =
          filter === "all" || categories.includes(filter);

        card.hidden = !showCard;

        if (showCard && !reduceMotion) {
          card.animate(
            [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            {
              duration: 350,
              easing: "ease-out"
            }
          );
        }
      });
    });
  });

});

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const dropdownItems = document.querySelectorAll(
    ".nav-item.has-dropdown"
  );

  // Mobile dropdown interaction
  dropdownItems.forEach((item) => {
    const link = item.querySelector(":scope > a");
    const submenu = item.querySelector(":scope > .dropdown-menu");

    if (!link || !submenu) return;

    link.addEventListener("click", (event) => {
      if (window.innerWidth > 1100) return;

      const isOpen = item.classList.contains("dropdown-open");

      if (!isOpen) {
        event.preventDefault();

        dropdownItems.forEach((otherItem) => {
          otherItem.classList.remove("dropdown-open");
        });

        item.classList.add("dropdown-open");
      }
    });
  });

  // Close the navigation after selecting a normal link
  if (navLinks && menuToggle) {
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (
          window.innerWidth <= 1100 &&
          !link.parentElement.classList.contains("has-dropdown")
        ) {
          menuToggle.checked = false;
        }
      });
    });
  }

  // Close the menu when switching back to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      if (menuToggle) menuToggle.checked = false;

      dropdownItems.forEach((item) => {
        item.classList.remove("dropdown-open");
      });
    }
  });
});

});
