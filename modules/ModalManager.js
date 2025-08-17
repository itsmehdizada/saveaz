// Handles both details modal and rating modal
import { CONSTANTS } from '../utils/constants.js';
import { getCategoryIcon, getCategoryClass, capitalize } from '../utils/helpers.js';

export class ModalManager {
  constructor({ bus, store, security, helpers }) {
    this.bus = bus;
    this.store = store;
    this.security = security;
    this.helpers = helpers;
    this.modalsData = null;
  }

  async init() {
    
    
    this.discountModal = document.getElementById('discountModal');
    this.ratingOverlay = document.getElementById('ratingModal');
    this.ratingCard = this.ratingOverlay?.querySelector('.rating-modal-card');
    this.ratingStars = Array.from(this.ratingOverlay?.querySelectorAll('.rating-star') || []);
    this.ratingSubmit = this.ratingOverlay?.querySelector('.rating-submit');
    this.selectedRating = 0;
    this.totalRatings = 0;
    this.ratingSum = 0;

    // Lazy-load modal data when first needed for faster startup
    this.modalsData = null;

    // Capture default/static content for the featured modal to allow reset
    this.defaultContent = {};
    if (this.discountModal) {
      const $ = (sel) => this.discountModal.querySelector(sel);
      const dImg = $('.discount-modal-img');
      const dTitle = $('.discount-modal-title');
      const dBadge = $('.discount-modal-badge');
      const dCategory = $('.discount-modal-category');
      const dLocation = $('.discount-modal-location');
      const dStar = $('.discount-modal-star');
      const dRating = $('.discount-modal-rating-value');
      const dDesc = $('.discount-modal-desc');
      const dNote = $('.discount-modal-note');
      const dRules = $('.discount-modal-rules ul');
      const dValidity = $('.discount-modal-validity-dates');
      const dBranches = $('.discount-modal-branches ul');
      const dContact = $('.discount-modal-contact ul');
      const dMap = $('.discount-modal-map');
      const dMenuBadgeLink = $('.discount-modal-menu-badge-link');
      this.defaultContent = {
        img: dImg?.src || '',
        title: dTitle?.textContent || '',
        badge: dBadge?.textContent || '',
        categoryHTML: dCategory?.innerHTML || '',
        categoryClass: dCategory?.className || '',
        location: dLocation?.textContent || '',
        star: dStar?.textContent || '',
        rating: dRating?.textContent || '',
        desc: dDesc?.textContent || '',
        note: dNote?.textContent || '',
        rulesHTML: dRules?.innerHTML || '',
        validity: dValidity?.textContent || '',
        branchesHTML: dBranches?.innerHTML || '',
        contactHTML: dContact?.innerHTML || '',
        map: dMap?.src || '',
        menuHref: dMenuBadgeLink?.getAttribute('href') || '',
        menuDisplay: dMenuBadgeLink?.style.display || ''
      };
    }

    // Open details modal from existing UI
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('.details-button, .map-link-mobile, .map-button');
      if (!btn) return;
      e.preventDefault();
      const card = btn.closest('.discount-card, .featured-card');
      const modalId = btn.getAttribute('data-modal-id') || card?.getAttribute('data-modal-id');
      const imgSrc = card?.querySelector('img')?.src;
      const isDiscountCard = card?.classList.contains('discount-card');
      if (isDiscountCard) {
        const ensureData = async () => {
          if (!this.modalsData) {
            try { 
              this.modalsData = await this.fetchData(
                `${CONSTANTS.MODALS_URL}?t=${Date.now()}`
              ); 
            } catch (e) { this.modalsData = null; }
          }
        };
        ensureData().then(() => {
          if (modalId && this.modalsData) {
            const data = this.modalsData.find(m => String(m.id) === String(modalId));
            if (data) this.fillDetailsModal(data);
          }
        });
      } else {
        // Featured card or any element without modalId → reset to default static content
        this.resetDetailsModalToDefault();
      }
      this.openOverlay(this.discountModal, imgSrc);
    });

    // Close on overlay click and ESC
    this.discountModal?.addEventListener('click', (e) => { if (e.target === this.discountModal) this.closeOverlay(this.discountModal); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeOverlay(this.discountModal); });
    this.discountModal?.querySelector('.discount-modal-close')?.addEventListener('click', () => this.closeOverlay(this.discountModal));

    // Rating modal
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.discount-modal-rating');
      if (trigger) this.openOverlay(this.ratingOverlay);
    });
    this.ratingOverlay?.addEventListener('click', (e) => { if (e.target === this.ratingOverlay) this.closeOverlay(this.ratingOverlay); });
    this.ratingStars.forEach((star, idx) => {
      const v = idx + 1;
      star.addEventListener('mouseenter', () => this.updateStars(v));
      star.addEventListener('mouseleave', () => this.updateStars(this.selectedRating));
      star.addEventListener('click', () => { this.selectedRating = v; this.updateStars(v); });
    });
    this.ratingSubmit?.addEventListener('click', () => {
      if (!this.selectedRating) return;
      this.totalRatings += 1;
      this.ratingSum += this.selectedRating;
      const average = this.ratingSum / this.totalRatings;
      // console.log intentionally removed by user. Keep silent or emit event
      this.bus.emit('rating:submitted', { average, total: this.totalRatings, value: this.selectedRating });
      this.closeOverlay(this.ratingOverlay);
    });
  }

  updateStars(value) {
    this.ratingStars.forEach((s, i) => s.classList.toggle('active', i < value));
  }

  openOverlay(el) {
    if (!el) return;
    el.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Ensure modal starts at top every time
    const resetScroll = () => {
      try {
        el.scrollTop = 0;
        const contentEls = el.querySelectorAll('.discount-modal-card, .discount-modal-content, .rating-modal-card');
        contentEls.forEach((node) => {
          if (typeof node.scrollTo === 'function') node.scrollTo(0, 0);
          node.scrollTop = 0;
        });
      } catch (_) { /* noop */ }
    };
    // Use RAF to apply after display change
    requestAnimationFrame(resetScroll);
  }
  closeOverlay(el) {
    if (!el) return;
    el.style.display = 'none';
    document.body.style.overflow = '';
    // Reset scroll so next open starts from top
    try {
      el.scrollTop = 0;
      const contentEls = el.querySelectorAll('.discount-modal-card, .discount-modal-content, .rating-modal-card');
      contentEls.forEach((node) => { node.scrollTop = 0; });
    } catch (_) { /* noop */ }
  }

  /**
   * Helper function to get contact icon based on contact type
   * @param {string} contactType - The type of contact (phone, email, instagram, etc.)
   * @returns {string} - Emoji icon for the contact type
   */
  getContactIcon(contactType) {
    const iconMap = {
      'phone': '📞',
      'mobile': '📱', 
      'email': '📧',
      'instagram': '📷',
      'facebook': '👥',
      'twitter': '🐦',
      'whatsapp': '💬',
      'telegram': '✈️',
      'website': '🌐',
      'address': '📍',
      'linkedin': '💼',
      'youtube': '📹',
      'tiktok': '🎵'
    };
    
    return iconMap[contactType.toLowerCase()] || '📞'; // Default to phone icon
  }

  /**
   * Helper function to format contact value based on type
   * @param {string} contactType - The type of contact
   * @param {string} contactValue - The contact value
   * @returns {object} - Object with formatted value and href (if applicable)
   */
  formatContactValue(contactType, contactValue) {
    const type = contactType.toLowerCase();
    let href = null;
    let displayValue = contactValue;

    switch (type) {
      case 'phone':
      case 'mobile':
        href = `tel:${contactValue.replace(/\s+/g, '')}`;
        break;
      case 'email':
        href = `mailto:${contactValue}`;
        break;
      case 'instagram':
        href = contactValue.startsWith('@') 
          ? `https://instagram.com/${contactValue.slice(1)}` 
          : `https://instagram.com/${contactValue}`;
        break;
      case 'facebook':
        href = contactValue.startsWith('http') 
          ? contactValue 
          : `https://facebook.com/${contactValue}`;
        break;
      case 'twitter':
        href = contactValue.startsWith('@') 
          ? `https://twitter.com/${contactValue.slice(1)}` 
          : `https://twitter.com/${contactValue}`;
        break;
      case 'whatsapp':
        href = `https://wa.me/${contactValue.replace(/\D/g, '')}`;
        break;
      case 'telegram':
        href = contactValue.startsWith('@') 
          ? `https://t.me/${contactValue.slice(1)}` 
          : `https://t.me/${contactValue}`;
        break;
      case 'website':
        href = contactValue.startsWith('http') ? contactValue : `https://${contactValue}`;
        break;
      case 'linkedin':
        href = contactValue.startsWith('http') 
          ? contactValue 
          : `https://linkedin.com/in/${contactValue}`;
        break;
      case 'youtube':
        href = contactValue.startsWith('http') 
          ? contactValue 
          : `https://youtube.com/@${contactValue}`;
        break;
      case 'tiktok':
        href = contactValue.startsWith('@') 
          ? `https://tiktok.com/${contactValue}` 
          : `https://tiktok.com/@${contactValue}`;
        break;
    }

    return { displayValue, href };
  }

  fillDetailsModal(modalData) {
  if (!this.discountModal || !modalData) return;
    const $ = (sel) => this.discountModal.querySelector(sel);
    const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = this.security.sanitizeText(txt); };
    const setSrc = (sel, url) => { const el = $(sel); if (el) el.src = this.security.sanitizeUrl(url); };
    setSrc('.discount-modal-img', modalData.image_url);
    setText('.discount-modal-title', modalData.title);
    setText('.discount-modal-badge', `${modalData.discount_amount} ENDİRİM`);
    setText('.discount-modal-location', (modalData.locations && modalData.locations[0]) || '');
    setText('.discount-modal-rating-value', modalData.rating);
    const reviewsEl = $('.discount-modal-reviews');
    if (reviewsEl) reviewsEl.style.display = 'none';
    setText('.discount-modal-desc', modalData.description);
    setText('.discount-modal-note', modalData['sub-description'] || '');
    const map = $('.discount-modal-map'); if (map) map.src = this.security.sanitizeUrl(modalData.map_url);
    
    // Toggle menu badge visibility and link for yemek category
    const menuBadgeLink = $('.discount-modal-menu-badge-link');
    if (menuBadgeLink) {
      const isFood = String(modalData.category || '').toLowerCase() === 'yemək';
      let menuUrl = modalData.menu_url;
      
      if (isFood && menuUrl && menuUrl.trim()) {
        menuBadgeLink.style.display = '';
        menuBadgeLink.setAttribute('href', this.security.sanitizeUrl(menuUrl));
        menuBadgeLink.setAttribute('target', '_blank');
        menuBadgeLink.setAttribute('rel', 'noopener noreferrer');
      } else {
        menuBadgeLink.style.display = 'none';
      }
    }
    
    const rules = $('.discount-modal-rules ul');
    if (rules) {
      rules.innerHTML = '';
      (modalData.requirements || []).forEach(r => {
        const li = document.createElement('li');
        const icon = this.security.createSecureElement('span', '✔️', 'discount-modal-rule-icon');
        li.appendChild(icon); li.appendChild(document.createTextNode(' ' + this.security.sanitizeText(r)));
        rules.appendChild(li);
      });
    }
    const branches = $('.discount-modal-branches ul');
    if (branches) {
      branches.innerHTML = '';
      (modalData.locations || []).forEach(loc => {
        const li = document.createElement('li');
        const icon = this.security.createSecureElement('span', '📍', 'discount-modal-branch-icon');
        li.appendChild(icon); li.appendChild(document.createTextNode(' ' + this.security.sanitizeText(loc)));
        branches.appendChild(li);
      });
    }

    // Handle contact info similar to branches and rules
    const contactList = $('.discount-modal-contact ul');
    if (contactList) {
      contactList.innerHTML = '';
      (modalData.contact_info || []).forEach(contact => {
        const li = document.createElement('li');
        const contactIcon = this.getContactIcon(contact.type);
        const { displayValue, href } = this.formatContactValue(contact.type, contact.value);
        
        const icon = this.security.createSecureElement('span', contactIcon, 'discount-modal-contact-icon');
        li.appendChild(icon);
        
        if (href) {
          // Create clickable link for contact info that supports it
          const link = document.createElement('a');
          link.href = this.security.sanitizeUrl(href);
          link.textContent = this.security.sanitizeText(displayValue);
          link.className = 'discount-modal-contact-link';
          
          // Add appropriate attributes for external links
          if (contact.type !== 'phone' && contact.type !== 'email') {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          }
          
          li.appendChild(document.createTextNode(' '));
          li.appendChild(link);
        } else {
          // Plain text for contact info without links
          li.appendChild(document.createTextNode(' ' + this.security.sanitizeText(displayValue)));
        }
        
        contactList.appendChild(li);
      });
    }

    // Apply category icon and class
    const catTag = $('.discount-modal-category');
    if (catTag) {
      catTag.className = `discount-modal-category ${getCategoryClass(modalData.category)}`;
      catTag.innerHTML = '';
      const iconEl = document.createElement('i');
      iconEl.className = 'discount-modal-category-icon';
      iconEl.setAttribute('data-lucide', getCategoryIcon(modalData.category));
      catTag.appendChild(iconEl);
      catTag.appendChild(document.createTextNode(' ' + capitalize(modalData.category)));
    }

    // Ensure lucide icons render for the newly added category icon
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  resetDetailsModalToDefault() {
    if (!this.discountModal || !this.defaultContent) return;
    const $ = (sel) => this.discountModal.querySelector(sel);
    const d = this.defaultContent;
    const dImg = $('.discount-modal-img');
    const dTitle = $('.discount-modal-title');
    const dBadge = $('.discount-modal-badge');
    const dCategory = $('.discount-modal-category');
    const dLocation = $('.discount-modal-location');
    const dStar = $('.discount-modal-star');
    const dRating = $('.discount-modal-rating-value');
    const dDesc = $('.discount-modal-desc');
    const dNote = $('.discount-modal-note');
    const dRules = $('.discount-modal-rules ul');
    const dValidity = $('.discount-modal-validity-dates');
    const dBranches = $('.discount-modal-branches ul');
    const dContact = $('.discount-modal-contact ul');
    const dMap = $('.discount-modal-map');
    if (dImg) dImg.src = d.img;
    if (dTitle) dTitle.textContent = d.title;
    if (dBadge) dBadge.textContent = d.badge;
    if (dCategory) { dCategory.className = d.categoryClass; dCategory.innerHTML = d.categoryHTML; }
    if (dLocation) dLocation.textContent = d.location;
    if (dStar) dStar.textContent = d.star;
    if (dRating) dRating.textContent = d.rating;
    const reviewsEl = this.discountModal.querySelector('.discount-modal-reviews');
    if (reviewsEl) reviewsEl.style.display = 'none';
    if (dDesc) dDesc.textContent = d.desc;
    if (dNote) dNote.textContent = d.note;
    if (dRules) dRules.innerHTML = d.rulesHTML;
    if (dValidity) dValidity.textContent = d.validity;
    if (dBranches) dBranches.innerHTML = d.branchesHTML;
    if (dContact) dContact.innerHTML = d.contactHTML || '';
    if (dMap) dMap.src = d.map;
    const dMenuLink = $('.discount-modal-menu-badge-link');
    if (dMenuLink) {
      dMenuLink.style.display = d.menuDisplay || '';
      dMenuLink.setAttribute('href', d.menuHref || '#');
    }
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  async fetchData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const data = await res.json();
    
    return data;
  }
}