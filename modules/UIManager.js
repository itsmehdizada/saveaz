// UI Manager: manages DOM refs, global UI listeners, accessibility helpers
export class UIManager {
  constructor({ bus, store, helpers }) {
    this.bus = bus;
    this.store = store;
    this.helpers = helpers;
    this.dom = {};
  }

  init() {
    // Store DOM references
    this.dom.searchInput = document.querySelector('.search-container input');
    this.dom.searchButton = document.querySelector('.search-button');
    this.dom.discountsGrid = document.querySelector('.discounts-grid');
    this.dom.showMore = document.querySelector('.show-more-button');
    this.dom.sortSelect = document.getElementById('sort');
    this.dom.regionSelect = document.getElementById('region');
    this.dom.categoryItems = document.querySelectorAll('.category-item');
    this.dom.mobileBubbles = document.querySelectorAll('.mobile-filter-bubbles .filter-bubble');
    this.dom.dropdownMenu = document.querySelector('.mobile-filter-bubbles .dropdown-menu');
    this.dom.dropdownBubble = document.querySelector('.mobile-filter-bubbles .has-dropdown');
    this.dom.hamburgerBtn = document.getElementById('hamburgerBtn');
    this.dom.mobileMenu = document.getElementById('mobileMenu');

    // Sync desktop sort select with current state on init
    if (this.dom.sortSelect) {
      const { filters } = this.store.get();
      this.dom.sortSelect.value = filters.sort === 'id' ? '' : (filters.sort || '');
    }

    // Wiring events delegated to managers via bus
    if (this.dom.searchInput) {
      const debounced = this.helpers.debounce((value) => {
        this.bus.emit('search:query', value);
      }, 300);
      this.dom.searchInput.addEventListener('input', (e) => debounced(e.target.value.trim().toLowerCase()));
      this.dom.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.bus.emit('search:submit');
      });
    }
    if (this.dom.searchButton) this.dom.searchButton.addEventListener('click', () => this.bus.emit('search:submit'));

    // Support mobile search icon tap
    document.body.addEventListener('click', (e) => {
      if (
        e.target.classList?.contains('search-icon') ||
        e.target.id === 'search-icon' ||
        e.target.closest?.('.search-icon') ||
        e.target.closest?.('#search-icon')
      ) {
        if (window.innerWidth <= 480) this.bus.emit('search:submit');
      }
    });

    if (this.dom.sortSelect) this.dom.sortSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      // Map desktop "Hamısı" (empty value) to sort by id
      const sort = value === '' ? 'id' : value;
      this.bus.emit('filters:update', { sort });
    });
    if (this.dom.regionSelect) this.dom.regionSelect.addEventListener('change', (e) => {
      const v = e.target.value || 'all';
      this.bus.emit('filters:update', { location: v });
    });

    this.dom.categoryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = item.textContent.trim().toLowerCase();
        this.bus.emit('filters:update', { category: cat });
        const discountsSection = document.getElementById('discounts');
        if (discountsSection) discountsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (this.dom.showMore) {
      this.dom.showMore.addEventListener('click', () => {
        const { page } = this.store.get();
        this.store.set({ page: page + 1 });
        this.bus.emit('render:page');
      });
    }

    // Disable infinite scroll when "Daha çox göstər" button exists
    if (!this.dom.showMore) {
      const sentinel = document.createElement('div');
      sentinel.id = 'infinite-scroll-sentinel';
      this.dom.discountsGrid?.after(sentinel);
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const { filtered, page, pageSize } = this.store.get();
            const totalPages = Math.ceil(filtered.length / pageSize);
            if (page < totalPages) {
              this.store.set({ page: page + 1 });
              this.bus.emit('render:page');
            }
          }
        });
      }, { rootMargin: '200px' });
      io.observe(sentinel);
    }

    // Mobile filter bubbles (non-dropdown)
    this.dom.mobileBubbles.forEach(bubble => {
      const isDropdown = bubble.classList.contains('has-dropdown');
      if (isDropdown) return;
      bubble.addEventListener('click', () => {
        this.dom.mobileBubbles.forEach(b => b.classList.remove('active'));
        bubble.classList.add('active');
        const filterType = bubble.getAttribute('data-filter');
        if (filterType === 'all') {
          // For "Bütün endirimlər" bubble, reset filters and sort by id
          this.bus.emit('filters:update', { sort: 'id', location: 'all', category: '', search: '' });
        } else {
          this.bus.emit('filters:update', { sort: filterType });
        }
      });
    });

    // Dropdown bubble
    if (this.dom.dropdownBubble && this.dom.dropdownMenu) {
      // Ensure a dedicated label for the dropdown bubble so we can update text dynamically
      const existingLabel = this.dom.dropdownBubble.querySelector('.dropdown-label');
      if (!existingLabel) {
        const labelEl = document.createElement('span');
        labelEl.className = 'dropdown-label';
        labelEl.textContent = 'Məkan';
        const svgEl = this.dom.dropdownBubble.querySelector('svg');
        if (svgEl) {
          this.dom.dropdownBubble.insertBefore(labelEl, svgEl);
        } else {
          this.dom.dropdownBubble.prepend(labelEl);
        }
      }

      this.dom.dropdownBubble.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = this.dom.dropdownBubble.getBoundingClientRect();
        this.dom.dropdownMenu.style.top = (rect.bottom + 4) + 'px';
        this.dom.dropdownMenu.style.left = rect.left + 'px';
        this.dom.dropdownMenu.classList.toggle('show');
        this.dom.dropdownBubble.classList.toggle('active');
      });
      document.addEventListener('click', () => {
        this.dom.dropdownMenu.classList.remove('show');
        this.dom.dropdownBubble.classList.remove('active');
      });
      this.dom.dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dom.dropdownMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          const value = item.getAttribute('data-value') || 'all';
          const text = (item.textContent || '').trim();
          const label = this.dom.dropdownBubble.querySelector('.dropdown-label');
          if (label) label.textContent = text || 'Məkan';
          // Remove active state from other filter bubbles when location is applied
          this.dom.mobileBubbles.forEach(b => {
            if (!b.classList.contains('has-dropdown')) b.classList.remove('active');
          });
          this.bus.emit('filters:update', { location: value });
          this.dom.dropdownMenu.classList.remove('show');
          this.dom.dropdownBubble.classList.remove('active');
        });
      });
    }

    // Mobile hamburger
    if (this.dom.hamburgerBtn && this.dom.mobileMenu) {
      this.dom.hamburgerBtn.addEventListener('click', () => this.dom.mobileMenu.classList.toggle('show'));
      document.addEventListener('click', (e) => {
        if (!this.dom.hamburgerBtn.contains(e.target) && !this.dom.mobileMenu.contains(e.target)) this.dom.mobileMenu.classList.remove('show');
      });
    }
  }
}


