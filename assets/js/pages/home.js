// ============================================================================
// ODE WORKS - Home page logic
// ============================================================================
import { supabase } from '../supabase-client.js';
import { motorcycleCard, productCard, blogCard } from '../render.js';
import { skeletonCards } from '../utils.js';

const heroSlidesEl = document.getElementById('hero-slides');
const featuredMotoEl = document.getElementById('featured-motorcycles');
const featuredProductsEl = document.getElementById('featured-products');
const blogPreviewEl = document.getElementById('home-blog-preview');

if (featuredMotoEl) featuredMotoEl.innerHTML = skeletonCards(4);
if (featuredProductsEl) featuredProductsEl.innerHTML = skeletonCards(4);

async function loadHero() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('placement', 'hero')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const slides = (!error && data && data.length) ? data : FALLBACK_SLIDES;

  heroSlidesEl.innerHTML = slides.map(s => `
    <div class="swiper-slide">
      <div class="hero-slide-bg" style="background-image:url('${s.image_url}');"></div>
      <div class="hero-content">
        <span class="eyebrow">Ode Works</span>
        <h1>${s.title}</h1>
        <p>${s.subtitle || ''}</p>
        <div class="hero-cta">
          <a href="${s.link_url || 'motorcycles.html'}" class="btn btn-primary btn-lg">${s.button_text || 'Shop Now'}</a>
          <a href="about.html" class="btn btn-secondary btn-lg">Learn More</a>
        </div>
      </div>
    </div>
  `).join('');

  new Swiper('.hero-swiper', {
    loop: true,
    autoplay: { delay: 5500, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 800
  });
}

const FALLBACK_SLIDES = [
  { title: 'Ride Beyond Limits', subtitle: 'Discover the 2025 motorcycle lineup at Ode Works.', image_url: 'https://placehold.co/1920x900/0d0d0d/00e0ff?text=Ode+Works', link_url: 'motorcycles.html', button_text: 'Shop Motorcycles' }
];

async function loadFeaturedMotorcycles() {
  const { data, error } = await supabase
    .from('motorcycles')
    .select('*, brands(name), motorcycle_images(image_url, is_primary)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error || !data || !data.length) {
    featuredMotoEl.innerHTML = `<div class="empty-state"><i class="fa-solid fa-motorcycle"></i><p>Featured motorcycles will appear here once connected to Supabase.</p></div>`;
    return;
  }
  featuredMotoEl.innerHTML = data.map(motorcycleCard).join('');
}

async function loadFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(name), product_images(image_url, is_primary)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error || !data || !data.length) {
    featuredProductsEl.innerHTML = `<div class="empty-state"><i class="fa-solid fa-helmet-safety"></i><p>Featured accessories will appear here once connected to Supabase.</p></div>`;
    return;
  }
  featuredProductsEl.innerHTML = data.map(productCard).join('');
}

async function loadBlogPreview() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3);

  if (error || !data || !data.length) {
    blogPreviewEl.innerHTML = '';
    return;
  }
  blogPreviewEl.innerHTML = data.map(blogCard).join('');
}

loadHero();
loadFeaturedMotorcycles();
loadFeaturedProducts();
loadBlogPreview();
