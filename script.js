document.addEventListener("DOMContentLoaded", () => {
    // 1. Scroll progress and back-to-top button
    const progress = document.getElementById("scrollProgress");
    const backToTop = document.getElementById("backToTop");
  
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
  
    // 2. Animated number counters
    const counters = document.querySelectorAll(".counter");
  
    function animateCounter(counter) {
      if (counter.dataset.animated === "true") return;
  
      counter.dataset.animated = "true";
  
      const target = Number(counter.dataset.target);
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
  
      counters.forEach(counter => counterObserver.observe(counter));
    } else {
      counters.forEach(animateCounter);
    }
  
    // 3. Portfolio category filters
    const filterButtons = document.querySelectorAll(
      ".portfolio-filters .filter-btn"
    );

    const portfolioCards = document.querySelectorAll(
      ".portfolio-grid .portfolio-card[data-category]"
    );

    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        // Update active button
        filterButtons.forEach(item => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        // Show matching cards
        portfolioCards.forEach(card => {
          const matches =
            filter === "all" ||
            card.dataset.category === filter;

          card.classList.toggle("is-hidden", !matches);
        });
      });

      button.setAttribute(
        "aria-pressed",
        String(button.classList.contains("active"))
      );
    });
  
    // 4. Reveal elements when they enter the viewport
    const revealTargets = document.querySelectorAll(
      ".about-content, .about-image, .service-card, " +
      ".portfolio-card, .why-item, .faq-item, .contact-form"
    );
  
    if ("IntersectionObserver" in window) {
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
  
    // 5. Close the mobile navigation after selecting a link
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelectorAll(".nav-links a");
  
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (menuToggle) {
          menuToggle.checked = false;
        }
      });
    });
  
    // 6. FAQ: keep only one answer open at a time
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
  
    // 7. Contact form validation
    const contactForm = document.querySelector(".contact-form");
  
    contactForm?.addEventListener("submit", event => {
      if (!contactForm.checkValidity()) {
        event.preventDefault();
        contactForm.reportValidity();
      }
    });
    
  const dropdown = document.querySelector(".nav-links .dropdown");
  const dropdownToggle = dropdown?.querySelector(".dropdown-toggle");

  dropdownToggle?.setAttribute("aria-haspopup", "true");
  dropdownToggle?.setAttribute("aria-expanded", "false");

  dropdownToggle?.addEventListener("click", event => {
    // On mobile, the first tap opens the submenu.
    if (window.matchMedia("(max-width: 680px)").matches) {
      if (!dropdown.classList.contains("open")) {
        event.preventDefault();
        dropdown.classList.add("open");
        dropdownToggle.setAttribute("aria-expanded", "true");
      }
    }
  });

  dropdown?.querySelectorAll(".dropdown-menu a").forEach(link => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("open");
      dropdownToggle?.setAttribute("aria-expanded", "false");

      const menuToggle = document.getElementById("menu-toggle");
      if (menuToggle) menuToggle.checked = false;
    });
  });

  document.addEventListener("click", event => {
    if (dropdown && !dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
      dropdownToggle?.setAttribute("aria-expanded", "false");
    }
  });
const heroSlides = document.querySelectorAll("#home .hero-bg");

  if (heroSlides.length > 0) {
    let slideIndex = 0;

    heroSlides.forEach((slide, index) => {
      slide.classList.toggle("active", index === 0);
    });

    if (heroSlides.length > 1) {
      setInterval(() => {
        heroSlides[slideIndex].classList.remove("active");

        slideIndex = (slideIndex + 1) % heroSlides.length;

        heroSlides[slideIndex].classList.add("active");
      }, 5000);
    }
  } else {
    console.error("Hero slider: no background slides found.");
  }
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
  document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
  link.addEventListener('click', function (event) {
    const targetId = this.getAttribute('href');

    if (!targetId || !targetId.startsWith('#')) return;

    const target = document.querySelector(targetId);

    if (!target) return;

    // Show all projects before navigating
    document.querySelectorAll('.portfolio-card').forEach(card => {
      card.style.display = '';
    });

    // Reset active filter
    document.querySelectorAll('.filter-btn').forEach(button => {
      button.classList.remove('active');

      if (button.dataset.filter === 'all') {
        button.classList.add('active');
      }
    });

    // Navigate to the selected project
    event.preventDefault();

    history.replaceState(null, '', targetId);

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

 // 8. Animated service cards on scroll
  const serviceCards = document.querySelectorAll(
    ".detailed-services .detail-card"
  );

  if (serviceCards.length > 0) {
    if (
      "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
  }

});

