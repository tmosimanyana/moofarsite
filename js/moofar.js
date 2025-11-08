// -------------------- MOBILE MENU --------------------
function toggleMenu() {
  const nav = document.querySelector('nav ul');
  const btn = document.querySelector('.menu-btn');
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !expanded);
  nav.classList.toggle('open');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const nav = document.querySelector('nav ul');
  const menuBtn = document.querySelector('.menu-btn');
  if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
  }
});

// -------------------- SCROLL ANIMATIONS --------------------
function animateOnScroll() {
  const elements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  elements.forEach(el => observer.observe(el));
}

// -------------------- PARALLAX HERO --------------------
function initParallax() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.backgroundPosition = `center ${scrolled * 0.5}px`;
  });
}

// -------------------- INIT --------------------
document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
  initParallax();
});
// build-images.js
// Node.js script using sharp to generate AVIF, WebP and JPEG variants
// Install: npm install sharp
// Run: node build-images.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'assets', 'source'); // place your high-res masters here
const outDir = path.join(__dirname, 'assets');
const images = [
  'gallery1','gallery10','gallery12','gallery13','gallery17','gallery18',
  'gallery20','gallery23','gallery4','gallery22','gallery0'
];
const sizes = [400, 800, 1200];

async function ensureOut() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
}

async function buildImage(name) {
  const masterJpg = path.join(srcDir, `${name}.jpg`);
  const masterPng = path.join(srcDir, `${name}.png`);
  const input = fs.existsSync(masterJpg) ? masterJpg : (fs.existsSync(masterPng) ? masterPng : null);
  if (!input) {
    console.warn(`Skipping ${name}: master not found in ${srcDir}`);
    return;
  }

  await Promise.all(sizes.map(async (w) => {
    const outBase = path.join(outDir, `${name}-${w}`);
    // AVIF
    await sharp(input)
      .resize({ width: w })
      .avif({ quality: 60 })
      .toFile(`${outBase}.avif`);
    // WebP
    await sharp(input)
      .resize({ width: w })
      .webp({ quality: 70 })
      .toFile(`${outBase}.webp`);
    // JPEG fallback
    await sharp(input)
      .resize({ width: w })
      .jpeg({ quality: 80 })
      .toFile(`${outBase}.jpg`);
  }));

  console.log(`Built variants for ${name}`);
}

async function buildAll() {
  await ensureOut();
  for (const name of images) {
    try {
      await buildImage(name);
    } catch (err) {
      console.error(`Error building ${name}:`, err);
    }
  }
  console.log('All done');
}

buildAll().catch(err => {
  console.error(err);
  process.exit(1);
});

