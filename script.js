const projectCards = [...document.querySelectorAll('.project-card')];
const detailPanels = [...document.querySelectorAll('.detail-panel')];
const seagull = document.querySelector('.seagull');
const petalLayer = document.querySelector('.petal-layer');
const hero = document.querySelector('.hero');
const heroBackground = document.querySelector('.hero-bg');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function selectProject(projectId) {
  const selectedIndex = projectCards.findIndex((card) => card.dataset.project === projectId);
  document.querySelectorAll('[data-exhibit]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.exhibit === projectId)));
  projectCards.forEach((card) => {
    const selected = card.dataset.project === projectId;
    card.classList.toggle('active', selected);
    card.setAttribute('aria-selected', String(selected));
    card.tabIndex = selected ? 0 : -1;
    const position = (projectCards.indexOf(card) - selectedIndex + projectCards.length) % projectCards.length;
    card.dataset.position = String(position);
    card.style.setProperty('--card-tilt-x', '0deg');
    card.style.setProperty('--card-tilt-y', '0deg');
  });
  detailPanels.forEach((panel) => {
    const selected = panel.dataset.detail === projectId;
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
}

projectCards.forEach((card, index) => {
  card.id = `project-${card.dataset.project}`;
  card.setAttribute('aria-controls', `detail-${card.dataset.project}`);
  card.addEventListener('click', () => selectProject(card.dataset.project));
  card.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1;
    const nextCard = projectCards[(index + direction + projectCards.length) % projectCards.length];
    nextCard.focus();
    selectProject(nextCard.dataset.project);
  });
});

detailPanels.forEach((panel) => {
  panel.id = `detail-${panel.dataset.detail}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', `project-${panel.dataset.detail}`);
});
selectProject('math');
const deck = document.querySelector('.project-deck');
deck.setAttribute('aria-orientation', 'vertical');
let lastWheelTime = 0;
deck.addEventListener('wheel', (event) => {
  if (event.ctrlKey || Math.abs(event.deltaY) < 8) return;
  const activeIndex = projectCards.findIndex((card) => card.classList.contains('active'));
  const nextIndex = activeIndex + Math.sign(event.deltaY);
  if (nextIndex < 0 || nextIndex >= projectCards.length) return;
  event.preventDefault();
  if (performance.now() - lastWheelTime < 650) return;
  lastWheelTime = performance.now();
  selectProject(projectCards[nextIndex].dataset.project);
}, { passive: false });
const careerTabs = [...document.querySelectorAll('[data-career]')];
function selectCareer(index) {
  careerTabs.forEach((tab, position) => {
    tab.setAttribute('aria-selected', String(position === index));
    tab.tabIndex = position === index ? 0 : -1;
    document.getElementById(`career-panel-${position}`).hidden = position !== index;
  });
}
careerTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCareer(index));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? careerTabs.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + careerTabs.length) % careerTabs.length;
    selectCareer(target);
    careerTabs[target].focus();
  });
});
document.querySelectorAll('[data-exhibit]').forEach((button) => {
  button.addEventListener('click', () => selectProject(button.dataset.exhibit));
});
projectCards.forEach((card) => {
  card.querySelector('.card-action').textContent = '选择这件作品';
  card.addEventListener('pointermove', (event) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !card.classList.contains('active')) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--card-tilt-x', `${((event.clientY - bounds.top) / bounds.height - .5) * -5}deg`);
    card.style.setProperty('--card-tilt-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 6}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--card-tilt-x', '0deg');
    card.style.setProperty('--card-tilt-y', '0deg');
  });
});

function createPetal(x, y) {
  const petal = document.createElement('i');
  petal.className = 'petal';
  petal.style.left = `${x}px`;
  petal.style.top = `${y}px`;
  petal.style.setProperty('--drift', `${(Math.random() - 0.5) * 80}px`);
  petalLayer.append(petal);
  petal.addEventListener('animationend', () => petal.remove());
}

function syncHeroEffects() {
  const heroBounds = hero.getBoundingClientRect();
  const visible = heroBounds.bottom > 80 && heroBounds.top < innerHeight;
  seagull.classList.toggle('hidden', !visible || reducedMotion);
  petalLayer.style.clipPath = `inset(0 0 ${Math.max(0, innerHeight - heroBounds.bottom)}px 0)`;
  if (!visible) petalLayer.replaceChildren();
}
syncHeroEffects();
window.addEventListener('scroll', syncHeroEffects, { passive: true });
window.addEventListener('resize', syncHeroEffects);

if (!reducedMotion && matchMedia('(pointer:fine)').matches) {
  let lastPetalTime = 0;
  window.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const onHero = event.clientY >= bounds.top && event.clientY < bounds.bottom && bounds.bottom > 80;
    seagull.classList.toggle('hidden', !onHero);
    if (!onHero) return;

    const horizontal = (event.clientX - bounds.left) / bounds.width - .5;
    const vertical = (event.clientY - bounds.top) / bounds.height - .5;
    hero.style.setProperty('--scene-x', `${horizontal * -85}px`);
    hero.style.setProperty('--scene-y', `${vertical * -50}px`);
    hero.style.setProperty('--frame-x', `${horizontal * 60}px`);
    hero.style.setProperty('--frame-y', `${vertical * 38}px`);
    hero.style.setProperty('--branch-x', `${horizontal * 155}px`);
    hero.style.setProperty('--branch-y', `${vertical * 100}px`);
    hero.style.setProperty('--tilt', `${horizontal * 11}deg`);
    const targetX = Math.max(45, Math.min(innerWidth - 50, event.clientX + 70));
    const targetY = Math.min(bounds.bottom - 30, Math.max(95, event.clientY - 55));
    const currentX = seagull.offsetLeft;
    const rotation = Math.max(-12, Math.min(12, (targetX - currentX) * 0.035));
    seagull.style.left = `${targetX}px`;
    seagull.style.top = `${targetY}px`;
    seagull.style.setProperty('--bird-rotate', `${rotation}deg`);

    const now = performance.now();
    if (now - lastPetalTime > 380) {
      createPetal(event.clientX, event.clientY);
      lastPetalTime = now;
    }
  });

  hero.addEventListener('pointerleave', () => {
    ['--scene-x','--scene-y','--frame-x','--frame-y','--branch-x','--branch-y'].forEach((property) => hero.style.setProperty(property, '0px'));
    hero.style.setProperty('--tilt', '0deg');
  });
}
