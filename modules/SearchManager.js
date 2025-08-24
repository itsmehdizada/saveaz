export class SearchManager {
  constructor({ bus, store, helpers }) {
    this.bus = bus;
    this.store = store;
    this.helpers = helpers;
    this.searchInput = null;
    this.debounceTimeout = null;
  }

  init() {
    // Find search input element
    this.searchInput = document.querySelector('[data-search-input]') || 
                      document.querySelector('input[type="search"]') || 
                      document.querySelector('#search') ||
                      document.querySelector('.search-input');

    if (this.searchInput) {
      this.initSearchInput();
    }

    // Scroll to discounts on submit
    this.bus.on('search:submit', () => {
      const discountsSection = document.getElementById('discounts');
      if (discountsSection) {
        discountsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Handle search suggestions/autocomplete if needed
    this.bus.on('search:suggestions', (query) => {
      this.showSuggestions(query);
    });
  }

  initSearchInput() {
    // Real-time search with debouncing
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      
      // Clear previous timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // Debounce search to avoid too many calls
      this.debounceTimeout = setTimeout(() => {
        this.bus.emit('search:query', query);
        
        // Show search suggestions if query is not empty
        if (query.length > 1) {
          this.bus.emit('search:suggestions', query);
        }
      }, 300); // Wait 300ms after user stops typing
    });

    // Handle Enter key
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.bus.emit('search:submit');
      }
    });

    // Handle form submission if search is in a form
    const form = this.searchInput.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.bus.emit('search:submit');
      });
    }
  }

  // Optional: Show search suggestions based on available discounts
  showSuggestions(query) {
    const { discounts } = this.store.get();
    const suggestions = this.generateSuggestions(query, discounts);
    
    // Emit suggestions for other modules to handle display
    this.bus.emit('search:suggestions:update', suggestions);
  }

  generateSuggestions(query, discounts) {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set();

    // Collect suggestions from titles, brands, and categories
    discounts.forEach(discount => {
      const title = (discount.title || '').toLowerCase();
      const brand = (discount.brand || '').toLowerCase();
      const category = (discount.category || '').toLowerCase();

      // Add partial matches from titles
      if (title.includes(queryLower)) {
        suggestions.add(discount.title);
      }

      // Add brand suggestions
      if (brand.includes(queryLower)) {
        suggestions.add(discount.brand);
      }

      // Add category suggestions
      if (category.includes(queryLower)) {
        suggestions.add(discount.category);
      }
    });

    // Convert to array and limit suggestions
    return Array.from(suggestions).slice(0, 5);
  }

  // Method to programmatically set search query
  setSearchQuery(query) {
    if (this.searchInput) {
      this.searchInput.value = query;
      this.bus.emit('search:query', query);
    }
  }

  // Method to clear search
  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.bus.emit('search:query', '');
    }
  }

  // Get current search query
  getCurrentQuery() {
    return this.searchInput ? this.searchInput.value : '';
  }
}
