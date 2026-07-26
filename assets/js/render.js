// ============================================================================
// ODE WORKS - Shared card renderers, reused across home/services/gallery/blog
// ============================================================================
import { formatCurrency } from './utils.js';

export function serviceCard(service) {
  return `
    <article class="card service-card" data-service-id="${service.id}">
      <div class="service-card-photo"><img src="${service.photo}" alt="${service.name}" loading="lazy"></div>
      <div class="service-card-body">
        <div class="icon-wrap"><i class="${service.icon}"></i></div>
        <h4>${service.name}</h4>
        <p class="mt-1">${service.shortDescription}</p>
        <div class="price-tag">${formatCurrency(service.priceFrom)} <span>starting price</span></div>
      </div>
    </article>
  `;
}

export function galleryCard(item) {
  return `
    <article class="card gallery-card" data-gallery-id="${item.id}">
      <div class="gallery-compare">
        <span class="tag before-tag">Before</span>
        <span class="tag after-tag">After</span>
        <img src="${item.before}" alt="${item.title} - before">
        <img src="${item.after}" alt="${item.title} - after" class="after-img">
        <div class="divider-line"></div>
      </div>
      <div class="card-body">
        <span class="text-muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;">${item.category}</span>
        <h4>${item.title}</h4>
      </div>
    </article>
  `;
}

export function testimonialCard(t) {
  const initials = t.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const stars = Array.from({ length: 5 }).map((_, i) => `<i class="fa-solid fa-star" style="${i < t.rating ? '' : 'opacity:0.25;'}"></i>`).join('');
  return `
    <div class="card testimonial-card">
      <div class="rating">${stars}</div>
      <p class="quote">"${t.quote}"</p>
      <div class="testimonial-author">
        <div class="avatar">${initials}</div>
        <div><strong>${t.name}</strong><div class="text-muted" style="font-size:0.8rem;">${t.location}</div></div>
      </div>
    </div>
  `;
}

export function blogCard(post) {
  return `
    <article class="card blog-card">
      <a href="blog-post.html?slug=${post.slug}"><img src="${post.coverImage}" alt="${post.title}" loading="lazy"></a>
      <div class="card-body" style="padding:20px;">
        <div class="blog-meta"><span>${post.category}</span><span>${new Date(post.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
        <h4><a href="blog-post.html?slug=${post.slug}">${post.title}</a></h4>
        <p class="mt-1" style="font-size:0.9rem;">${post.excerpt}</p>
      </div>
    </article>
  `;
}

export function mechanicCard(m) {
  return `
    <div class="card mechanic-card">
      <img src="${m.photo}" alt="${m.name}">
      <h4>${m.name}</h4>
      <p class="text-muted" style="font-size:0.85rem;">${m.specialty}</p>
      <p class="mt-1" style="font-size:0.8rem;">${m.yearsExperience} years experience</p>
    </div>
  `;
}
