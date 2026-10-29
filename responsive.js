document.addEventListener('DOMContentLoaded', () => {
  const navigation = document.getElementById('mainNavigation');
  if (!navigation || !window.bootstrap) return;
  const collapse = bootstrap.Collapse.getOrCreateInstance(navigation, { toggle: false });
  const toggler = document.querySelector('.navbar-toggler');
  function closeMenu() {
    navigation.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(button => bootstrap.Dropdown.getInstance(button)?.hide());
    collapse.hide();
  }
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (window.innerWidth < 1200) closeMenu();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('show')) {
      closeMenu();
      toggler?.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header') && navigation.classList.contains('show')) closeMenu();
  });
  window.matchMedia('(min-width: 1200px)').addEventListener('change', closeMenu);
});

// Progressive interaction effects: content remains visible without JavaScript.
document.addEventListener('DOMContentLoaded', () => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = '.service-card,.card,.web-card,.partner-card,.country-card,.studio-industry-grid > article,.studio-steps > li';
  const running = new Set();
  function animate(element, frames, options) {
    if (motion.matches || !element.animate) return;
    const effect = element.animate(frames, options);
    running.add(effect);
    effect.finished.then(() => running.delete(effect), () => running.delete(effect));
  }
  // Track the pointer only over a card; no page-wide animation loop.
  document.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches) return;
    const card = event.target.closest(cards);
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  }, { passive: true });
  document.addEventListener('click', event => {
    const button = event.target.closest('.btn,.web-btn,.about-btn,.nav-cta,.footer-cta-btn');
    if (button) animate(button, [{transform:'scale(.97)'},{transform:'scale(1)'}], {duration:220,easing:'ease-out'});
  });
  document.querySelectorAll('.faq-item').forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      details.querySelectorAll('p').forEach(p => animate(p, [{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}], {duration:220,easing:'ease-out'}));
    });
  });
  let observer;
  if ('IntersectionObserver' in window && !motion.matches) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const image = entry.target.matches('.about-image,.featured-image,.outdoor-service-photo');
        const heading = entry.target.matches('.section-heading,.studio-heading,.portfolio-heading,.faq-heading');
        animate(entry.target, [
          {opacity:0,translate:heading ? '0 22px' : '0 32px',scale:image ? '.94' : heading ? '1' : '.97', ...(image ? {clipPath:'inset(8% 3% round 18px)'} : {})},
          {opacity:1,translate:'0 0',scale:'1', ...(image ? {clipPath:'inset(0% 0% round 18px)'} : {})}
        ], {duration:image ? 850 : 650,delay:Math.min(entries.indexOf(entry) % 4,3)*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
      });
    }, {threshold:0,rootMargin:'0px 0px -40px 0px'});
    // Keep one reveal per content block, without animating its children again.
    const selectors = '.section-heading,.about-content,.about-image,.service-card,.detail-card,.portfolio-heading,.portfolio-card,.why-description,.why-item,.testimonial-content,.faq-heading,.faq-item,.contact-content,.contact-form,.result-card,.featured-image,.featured-content,.process-card,.channel-card,.testimonial-card,.brief-content,.brief-form,.insight-card,.card,.web-card,.partner-card,.feature-card,.mission-card,.value-card,.studio-heading,.studio-steps > li,.studio-industry-grid > article,.seo-service-detail,.outdoor-service-photo,.contact-office';
    const targets = [...document.querySelectorAll(selectors)]
      .filter(el => !el.closest('.header,.footer,.country-page,[class*="hero"],[data-no-reveal]'));
    const targetSet = new Set(targets);
    targets.forEach(el => {
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        if (targetSet.has(parent)) return;
      }
      // Neutralize legacy reveal states; the shared observer owns this effect.
      el.classList.add('scroll-pop', 'visible', 'is-visible');
      observer.observe(el);
    });
  }
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer?.disconnect();
    running.forEach(effect => effect.cancel());
    running.clear();
  });
});

// Desktop dropdowns also open on hover; Bootstrap retains click and keyboard control.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.bootstrap) return;
  const desktop = matchMedia('(min-width:1400px) and (hover:hover)');
  document.querySelectorAll('.header .has-dropdown').forEach(item => {
    const button = item.querySelector(':scope > .submenu-toggle');
    if (!button) return;
    let closeTimer;
    item.addEventListener('pointerenter', () => {
      clearTimeout(closeTimer);
      if (desktop.matches) bootstrap.Dropdown.getOrCreateInstance(button).show();
    });
    item.addEventListener('pointerleave', () => {
      if (desktop.matches) closeTimer = setTimeout(() => {
        if (!item.contains(document.activeElement)) bootstrap.Dropdown.getInstance(button)?.hide();
      }, 160);
    });
  });
});

// Content-aware finishing effects and a visitor-controlled contact dialog.
document.addEventListener('DOMContentLoaded', () => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const reveal = element => {
    if (motion.matches || !element.animate) return;
    const effect = element.animate([{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}], {duration:480,easing:'cubic-bezier(.2,.7,.2,1)'});
    active.add(effect);
    effect.finished.then(() => active.delete(effect), () => active.delete(effect));
  };
  let observer;
  if ('IntersectionObserver' in window && !motion.matches) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      reveal(entry.target);
    }), {threshold:.12});
    document.querySelectorAll('main .section > .container > h2, .outdoor-service-photo, .contact-office').forEach(el => {
      if (!el.closest('.reveal,.scroll-pop')) observer.observe(el);
    });
  }
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer?.disconnect();
    active.forEach(effect => effect.cancel());
    active.clear();
  });
  if (document.querySelector('.floating-whatsapp')) return;
  const whatsapp = document.createElement('a');
  whatsapp.className = 'floating-whatsapp';
  whatsapp.href = 'https://wa.me/919324850002';
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.setAttribute('aria-label', 'Chat with us on WhatsApp');
  whatsapp.title = 'Chat with us on WhatsApp';
  whatsapp.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span class="mobile-whatsapp-copy"><strong>Talk to your growth partner</strong><span>Your next big idea starts here.</span></span><span class="mobile-whatsapp-arrow" aria-hidden="true">↗</span>';
  document.body.append(whatsapp);
});

// Lightweight interaction details shared by every page, including region pages.
document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const effects = new Set();
  const play = (el, frames, options = {}) => {
    if (reduced.matches || !el?.animate) return;
    const effect = el.animate(frames, {duration:500, easing:'cubic-bezier(.16,1,.3,1)', ...options});
    effects.add(effect);
    effect.finished.then(() => effects.delete(effect), () => effects.delete(effect));
  };
  const cards = '.service-card,.web-card,.partner-card,.country-card,.feature-card,.value-card,.studio-industry-grid > article';
  document.querySelectorAll(cards).forEach(el => el.classList.add('interactive-surface'));
  let frame = 0;
  let current;
  document.addEventListener('pointermove', event => {
    if (reduced.matches || !pointer.matches) return;
    const card = event.target.closest('.interactive-surface');
    if (!card) return;
    const x = event.clientX, y = event.clientY;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (current && current !== card) current.classList.remove('surface-active');
      current = card;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${x - rect.left}px`);
      card.style.setProperty('--glow-y', `${y - rect.top}px`);
      card.classList.add('surface-active');
    });
  }, {passive:true});
  document.addEventListener('pointerout', event => {
    const card = event.target.closest('.interactive-surface');
    if (card && !card.contains(event.relatedTarget)) {
      cancelAnimationFrame(frame);
      card.classList.remove('surface-active');
      if (current === card) current = null;
    }
  }, {passive:true});
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const button = event.target.closest('.btn,.web-btn,.about-btn,.nav-cta,.footer-cta-btn,.country-button,button[type="submit"]');
    if (button && !button.disabled) play(button, [{scale:'1'},{scale:'.96',offset:.35},{scale:'1'}], {duration:280});
  });
  // Stagger the first screen without changing text or delaying navigation.
  if (!document.querySelector('.country-page,.graphic-detail-hero,.graphic-design-hero')) {
    document.querySelectorAll('main > :first-child h1,main > :first-child .eyebrow,main > :first-child .hero-description,main > :first-child .hero-buttons')
      .forEach((el, i) => play(el, [{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}], {duration:750,delay:i * 80,fill:'backwards'}));
  }
  document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => {
    if (!details.open || details.classList.contains('faq-item')) return;
    [...details.children].filter(el => el.tagName !== 'SUMMARY').forEach(el => play(el, [{opacity:0,translate:'0 -6px'},{opacity:1,translate:'0 0'}]));
  }));
  const reset = () => {
    cancelAnimationFrame(frame);
    current?.classList.remove('surface-active');
    effects.forEach(effect => effect.cancel());
    effects.clear();
  };
  reduced.addEventListener('change', reset);
  pointer.addEventListener('change', reset);
});

// Show the safety notice before visitors interact with their first page.
document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'gam-fraud-notice-v1';
  try { if (sessionStorage.getItem(storageKey) === 'seen') return; } catch (_) {}
  if (!('HTMLDialogElement' in window) || document.querySelector('#fraud-notice')) return;
  const previousFocus = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.id = 'fraud-notice';
  dialog.className = 'fraud-notice';
  dialog.setAttribute('aria-labelledby', 'fraud-notice-title');
  dialog.setAttribute('aria-describedby', 'fraud-notice-description');
  dialog.innerHTML = `
    <div class="fraud-notice-symbol" aria-hidden="true">!</div>
    <p class="fraud-notice-eyebrow">IMPORTANT SAFETY NOTICE</p>
    <h2 id="fraud-notice-title">Beware of fraudulent messages</h2>
    <p id="fraud-notice-description">Stay alert to messages, calls or emails from people pretending to represent Global Advertising Media Private Limited.</p>
    <ul>
      <li>Verify unexpected offers, payment requests and account details directly with our team before taking action.</li>
      <li>Never share your OTP, password, PIN or banking credentials through a message or an unverified link.</li>
      <li>Avoid suspicious links and attachments. Use the official contact details below if you are unsure.</li>
    </ul>
    <div class="fraud-notice-contact">
      <span>Verify with our team</span>
      <a href="mailto:enquiry@globaladvertisingmedia.in">enquiry@globaladvertisingmedia.in</a>
      <a href="tel:+919324850002">+91 9324 850 002</a>
    </div>
    <button type="button" class="fraud-notice-continue" autofocus>I understand — Continue to website <span aria-hidden="true">→</span></button>
    <p class="fraud-notice-caption">A quick reminder to help you browse safely.</p>`;
  document.body.append(dialog);
  const close = () => dialog.close();
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('fraud-notice-open');
    try { sessionStorage.setItem(storageKey, 'seen'); } catch (_) {}
    if (previousFocus && previousFocus !== document.body) previousFocus.focus();
    dialog.remove();
  }, {once:true});
  dialog.showModal();
  document.documentElement.classList.add('fraud-notice-open');
});

// Keep compact contact fields understandable without visible captions.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form.contact-form,form.outdoor-sidebar-form,form.site-enquiry-form,form.site-enquiry-existing').forEach(form => {
    form.querySelectorAll('input,textarea,select').forEach(field => {
      if (['hidden','checkbox','radio','submit','button','file'].includes(field.type)) return;
      const caption = field.labels?.[0]?.textContent.replace(/\s+/g, ' ').trim();
      if (field.tagName !== 'SELECT' && !field.placeholder && caption) field.placeholder = caption;
      if (field.name === 'phone' && !field.required) field.placeholder = 'Phone number (optional)';
      if (!caption && !field.getAttribute('aria-label')) {
        field.setAttribute('aria-label', field.placeholder || field.name || 'Enquiry field');
      }
    });
  });
});
