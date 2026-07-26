// ============================================================================
// ODE WORKS - Home page logic
// ============================================================================
import { SERVICES, GALLERY, TESTIMONIALS, BLOG_POSTS } from '../data.js';
import { serviceCard, galleryCard, testimonialCard, blogCard } from '../render.js';

document.getElementById('home-services-grid').innerHTML = SERVICES.slice(0, 6).map(serviceCard).join('');
document.getElementById('home-gallery-grid').innerHTML = GALLERY.slice(0, 3).map(galleryCard).join('');
document.getElementById('home-testimonials').innerHTML = TESTIMONIALS.slice(0, 3).map(testimonialCard).join('');
document.getElementById('home-blog-preview').innerHTML = BLOG_POSTS.slice(0, 3).map(blogCard).join('');
