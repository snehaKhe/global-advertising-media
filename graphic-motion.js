document.addEventListener('DOMContentLoaded', () => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  let observer;
  const play = (el, delay = 0) => {
    if (motion.matches || !el.animate) return;
    const effect = el.animate([{opacity:0,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:500,delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
    running.add(effect);
    effect.finished.then(()=>running.delete(effect),()=>running.delete(effect));
  };
  document.querySelectorAll('.graphic-detail-hero .container > *, .graphic-design-hero .container > *').forEach((el,i)=>play(el,Math.min(i*70,280)));
  if (!motion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      play(entry.target);
    }),{threshold:.12});
    document.querySelectorAll('.graphic-detail-intro > div,.graphic-detail-columns,.graphic-related').forEach(el=>observer.observe(el));
  }
  motion.addEventListener('change',()=>{if(motion.matches){observer?.disconnect();running.forEach(effect=>effect.cancel());running.clear();}});
});
