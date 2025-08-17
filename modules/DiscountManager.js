import { getCategoryIcon, getCategoryClass, capitalize } from '../utils/helpers.js';

// Responsible for loading discounts and rendering them efficiently
export class DiscountManager {
  constructor({ bus, store, security, helpers, constants }) {
    this.bus = bus;
    this.store = store;
    this.security = security;
    this.helpers = helpers;
    this.constants = constants;
    this.dom = {
      grid: document.querySelector('.discounts-grid')
    };
  }

  async init() {
    // Start data fetch immediately
    this.loadDiscounts();
    this.bus.on('render:list', () => this.render(true));
    this.bus.on('render:page', () => this.render(false));
    // Initial empty render to set structure
    this.render(true);
  }

  async loadDiscounts() {
    try {
      this.store.set({ loading: true, error: null });
      const data = await this.fetchData(this.constants.DISCOUNTS_URL);
      this.store.set({ discounts: data, filtered: data, page: 1 });
      // Apply current filters now that data is available (ensures default highest-discount sort)
      this.bus.emit('filters:apply');
    } catch (e) {
      this.store.set({ error: 'Məlumat yüklənə bilmədi.' });
    } finally {
      this.store.set({ loading: false });
    }
  }

  async fetchData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const data = await res.json();
    return data;
  }

  render(reset) {
    const grid = this.dom.grid;
    if (!grid) return;
    const { filtered, page, pageSize } = this.store.get();

    // Lazy render page
    const start = 0;
    const end = Math.min(filtered.length, page * pageSize);
    const slice = filtered.slice(start, end);

    if (reset) grid.innerHTML = '';

    // Diffing: append only missing cards
    const existingCount = grid.children.length;
    for (let i = existingCount; i < slice.length; i++) {
      const discount = slice[i];
      const card = this.createCard(discount, i);
      grid.appendChild(card);
    }

    // Update "Daha çox göstər" visibility if it exists
    const showMore = document.querySelector('.show-more-button');
    if (showMore) {
      showMore.style.display = end >= filtered.length ? 'none' : 'block';
    }

    // Create icons once per render batch (limit to grid scope)
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons({ icons: undefined }); } catch (e) { /* noop */ }
    }

    if (reset) {
      this.bus.emit('render:first-done');
    }
  }

  createCard(discount, indexInAll) {
    const card = document.createElement('div');
    card.className = 'discount-card';
    card.setAttribute('data-modal-id', this.security.sanitizeText(discount.id));

    // Image container
    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    const img = document.createElement('img');
    // Lazy: load first 6 images immediately for perceived performance
    const src = this.security.sanitizeUrl(discount.image_url);
    if (indexInAll < 6) {
      img.src = src;
    } else {
      img.dataset.src = src;
    }
    img.alt = this.security.sanitizeText(discount.title);
    img.onerror = function() { this.onerror = null; this.src = `https://placehold.co/300x200?text=${encodeURIComponent(discount.title)}`; };
    const badge = this.security.createSecureElement('div', `${this.security.sanitizeText(discount.discount_amount)} ENDİRİM`, 'discount-badge');
    cardImage.appendChild(img); cardImage.appendChild(badge);

    // Content
    const content = document.createElement('div');
    content.className = 'card-content';
    const titleRow = document.createElement('div');
    titleRow.className = 'card-title-row';
    const title = document.createElement('h3');
    title.textContent = this.security.sanitizeText(discount.title);
    const rating = document.createElement('div');
    rating.className = 'rating';
    rating.setAttribute('data-rating', parseFloat(discount.rating) || 0);
    rating.innerHTML = this.helpers.createStarRatingHTML(discount.rating);
    titleRow.appendChild(title); titleRow.appendChild(rating);

    const tags = document.createElement('div');
    tags.className = 'card-tags';
    const categoryTag = document.createElement('span');
    categoryTag.className = `tag tag-category ${getCategoryClass(discount.category)}`;
    const catIcon = document.createElement('i');
    catIcon.className = 'tag-category-icon';
    catIcon.setAttribute('data-lucide', getCategoryIcon(discount.category));
    categoryTag.appendChild(catIcon);
    categoryTag.appendChild(document.createTextNode(' ' + capitalize(discount.category)));
    const locationTag = document.createElement('span');
    locationTag.className = 'tag tag-location';
    const locIcon = document.createElement('i');
    locIcon.className = 'tag-location-icon';
    locIcon.setAttribute('data-lucide', 'map-pin');
    locationTag.appendChild(locIcon);
    locationTag.appendChild(document.createTextNode(' ' + discount.location));
    tags.appendChild(categoryTag); tags.appendChild(locationTag);

    const mobileDesc = this.security.createSecureElement('div', discount.mobile_description, 'mobile-card-description');
    const desktopDesc = this.security.createSecureElement('p', discount.desktop_description, 'description');

    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const requirement = document.createElement('span');
    requirement.className = 'requirement';
    const reqIconDesktop = document.createElement('i');
    reqIconDesktop.setAttribute('data-lucide', 'check-circle-2');
    reqIconDesktop.className = 'requirement-icon-desktop';
    const reqIconMobile = document.createElement('i');
    reqIconMobile.setAttribute('data-lucide', 'ticket');
    reqIconMobile.className = 'requirement-icon-mobile';
    requirement.appendChild(reqIconDesktop); requirement.appendChild(reqIconMobile);
    requirement.appendChild(document.createTextNode(discount['telebe+'] === true ? 'Tələbə+ kartı tələb olunur' : 'Tələbə kartı tələb olunur'));

    const detailsButton = document.createElement('a');
    detailsButton.href = '#';
    detailsButton.className = 'details-button';
    detailsButton.setAttribute('data-modal-id', this.security.sanitizeText(discount.id));
    detailsButton.textContent = 'Ətraflı';

    const mapLinkMobile = document.createElement('a');
    mapLinkMobile.href = '#';
    mapLinkMobile.className = 'map-link-mobile';
    mapLinkMobile.textContent = 'Ətraflı Bax';
    const mapLinkIcon = document.createElement('i');
    mapLinkIcon.setAttribute('data-lucide', 'chevron-right');
    mapLinkIcon.className = 'map-link-mobile-icon';
    mapLinkMobile.appendChild(mapLinkIcon);

    footer.appendChild(requirement);
    footer.appendChild(detailsButton);
    footer.appendChild(mapLinkMobile);

    content.appendChild(titleRow);
    content.appendChild(tags);
    content.appendChild(mobileDesc);
    content.appendChild(desktopDesc);
    content.appendChild(footer);

    card.appendChild(cardImage);
    card.appendChild(content);

    // Lazy-load image
    if (!img.src) {
      const io = this.helpers.ensureObserver((imgEl) => {
        const dataSrc = imgEl.dataset.src;
        if (dataSrc) imgEl.src = dataSrc;
      });
      io.observe(img);
    }

    return card;
  }
}


