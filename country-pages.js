document.addEventListener('DOMContentLoaded', () => {
  function filterList(inputId, listId, countSelector, emptySelector, noun) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;
    const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
    const count = document.querySelector(countSelector);
    const empty = document.querySelector(emptySelector);
    const more = inputId === 'state-search' ? document.getElementById('state-more') : null;
    let limit = more ? 60 : Infinity;
    const entries = [...list.children].map(item => ({item, text: normalize(item.textContent)}));
    function update() {
      const term = normalize(input.value);
      let visible = 0;
      for (const {item, text} of entries) {
        const matches = text.includes(term);
        item.hidden = !matches || visible >= limit;
        visible += Number(matches);
      }
      const label = visible === 1 ? noun : noun === 'country' ? 'countries' : `${noun}s`;
      if (count) count.textContent = `${visible} ${label}${term ? ' matching' : ' listed'}${visible > limit ? ` · showing ${limit}` : ''}`;
      if (empty) empty.hidden = visible > 0;
      if (more) more.hidden = visible <= limit;
    }
    input.addEventListener('input', () => { limit = more ? 60 : Infinity; update(); });
    more?.addEventListener('click', () => { limit += 60; update(); });
    update();
  }
  filterList('area-search', 'country-areas', '.country-area-count', '.country-no-results', 'area');
  filterList('country-search', 'country-directory', '.directory-count', '.directory-no-results', 'country');
  filterList('state-search', 'state-directory', '.state-count', '.state-no-results', 'region');

  const page = document.querySelector('.country-page');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!page || motion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  // Animate on entry without hiding content while it waits to be observed.
  const running = new Set();
  const animate = (element, frames, options) => {
    const animation = element.animate(frames, options);
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  };
  page.querySelectorAll('.country-hero-grid > div > *, .country-hero figure').forEach((element, index) => {
    animate(element, [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 650, delay: Math.min(index * 75, 350), easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motion.matches) return;
      const siblings = entry.target.parentElement.children;
      const index = Array.prototype.indexOf.call(siblings, entry.target);
      animate(entry.target, [
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 600, delay: (index % 3) * 65, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
  }, { threshold: .1 });
  page.querySelectorAll('.country-section-heading, .country-card, .country-process > li, .country-scope > article, .country-feature-split > img, .state-location-facts > div, .country-review-panel, .country-final-cta').forEach(element => observer.observe(element));

  // Stop in-flight effects if the visitor changes their system preference.
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
  });
});
