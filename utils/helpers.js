export class Helpers {
  constructor() {
    this.memo = new Map();
    this.observer = null;
  }

  debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  memoize(key, factory) {
    if (this.memo.has(key)) return this.memo.get(key);
    const value = factory();
    this.memo.set(key, value);
    return value;
  }

  createStarRatingHTML(rating) {
    const num = parseFloat(rating) || 0;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (num >= i) html += '<i data-lucide="star" class="star-filled"></i>';
      else if (num >= i - 0.5) html += '<i data-lucide="star-half" class="star-half"></i>';
    }
    return html;
  }

  // Lazy image loader with IntersectionObserver
  ensureObserver(callback) {
    if (this.observer) return this.observer;
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry.target);
          this.observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '200px' });
    return this.observer;
  }
}

// Category icon mapping
export function getCategoryIcon(category) {
  const icons = {
    geyim: 'shopping-bag',
    idman: 'dumbbell',
    kofe: 'coffee',
    kitab: 'book-open',
    texnologiya: 'laptop',
    tehsil: 'school',
    yemək: 'hamburger',
    digər: 'list'
  };
  const key = String(category || '').toLowerCase();
  return icons[key] || 'tag';
}

// Category CSS class mapping
export function getCategoryClass(category) {
  const classes = {
    geyim: 'geyim',
    idman: 'idman',
    kofe: 'kofe',
    kitab: 'kitab',
    texnologiya: 'texnologiya',
    'təhsil': 'tehsil',
    'yemək': 'yemek',
    'əyləncə': 'eylence',
    'digər': 'diger'
  };
  const key = String(category || '').toLowerCase();
  return classes[key] || 'default-category';
}

export function capitalize(str) {
  const s = String(str || '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}


