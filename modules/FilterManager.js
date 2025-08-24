// Handles filtering logic, memoization, and emits updates
export class FilterManager {
  constructor({ bus, store, helpers }) {
    this.bus = bus;
    this.store = store;
    this.helpers = helpers;
    
    // Synonym dictionary for Azerbaijani market - both Azerbaijani and English terms
    this.synonyms = {
      // Food & Dining - Yemək və Restoran
      'yemək': ['yemək', 'food', 'eating', 'meal', 'qida', 'restoran', 'restaurant', 'cafe', 'kafe'],
      'food': ['food', 'yemək', 'eating', 'meal', 'qida', 'restoran', 'restaurant', 'cafe', 'kafe'],
      'pizza': ['pizza', 'yemək', 'food', 'restoran', 'restaurant', 'dining', 'italyan'],
      'burger': ['burger', 'hamburger', 'fast food', 'mcdonalds', 'kfc', 'yemək', 'sandviç'],
      'kebab': ['kebab', 'kabab', 'şaşlıq', 'ət', 'meat', 'restoran', 'yemək'],
      'şaşlıq': ['şaşlıq', 'kebab', 'kabab', 'ət', 'meat', 'mangal', 'bbq'],
      'kafe': ['kafe', 'cafe', 'qəhvə', 'coffee', 'çay', 'tea', 'restoran', 'yemək'],
      'qəhvə': ['qəhvə', 'coffee', 'kafe', 'cafe', 'starbucks', 'içki', 'drink'],
      'çay': ['çay', 'tea', 'kafe', 'cafe', 'içki', 'drink', 'armudu'],
      
      // Technology - Texnologiya
      'telefon': ['telefon', 'phone', 'mobile', 'smartphone', 'iphone', 'android', 'samsung', 'huawei'],
      'phone': ['phone', 'telefon', 'mobile', 'smartphone', 'iphone', 'android', 'samsung', 'huawei'],
      'kompüter': ['kompüter', 'computer', 'laptop', 'pc', 'notebook', 'texnologiya', 'tech'],
      'laptop': ['laptop', 'kompüter', 'computer', 'notebook', 'macbook', 'pc', 'texnologiya'],
      'computer': ['computer', 'kompüter', 'laptop', 'pc', 'notebook', 'texnologiya', 'tech'],
      'texnologiya': ['texnologiya', 'technology', 'tech', 'kompüter', 'telefon', 'gadget'],
      'planşet': ['planşet', 'tablet', 'ipad', 'android tablet', 'texnologiya'],
      'oyun': ['oyun', 'game', 'gaming', 'xbox', 'playstation', 'steam', 'nintendo', 'video game'],
      'game': ['game', 'oyun', 'gaming', 'xbox', 'playstation', 'steam', 'nintendo', 'video game'],
      
      // Clothing & Fashion - Geyim və Moda
      'geyim': ['geyim', 'clothes', 'clothing', 'fashion', 'moda', 'paltar', 'kostyum'],
      'clothes': ['clothes', 'geyim', 'clothing', 'fashion', 'moda', 'paltar', 'kostyum'],
      'paltar': ['paltar', 'dress', 'clothes', 'geyim', 'moda', 'fashion', 'qadın'],
      'kostyum': ['kostyum', 'suit', 'formal', 'iş geyimi', 'business', 'geyim'],
      'ayaqqabı': ['ayaqqabı', 'shoes', 'sneakers', 'boots', 'sandal', 'footwear'],
      'shoes': ['shoes', 'ayaqqabı', 'sneakers', 'boots', 'sandal', 'footwear'],
      'moda': ['moda', 'fashion', 'style', 'geyim', 'trend', 'brand'],
      'köynək': ['köynək', 'shirt', 'blouse', 'geyim', 'top'],
      'şalvar': ['şalvar', 'pants', 'trousers', 'jeans', 'geyim'],
      
      // Beauty & Health - Gözəllik və Sağlamlıq
      'gözəllik': ['gözəllik', 'beauty', 'cosmetic', 'makeup', 'skin care', 'parfum'],
      'beauty': ['beauty', 'gözəllik', 'cosmetic', 'makeup', 'skin care', 'parfum'],
      'parfum': ['parfum', 'perfume', 'fragrance', 'gözəllik', 'ətir'],
      'idman': ['idman', 'sport', 'fitness', 'gym', 'exercise', 'workout', 'sağlamlıq'],
      'sport': ['sport', 'idman', 'fitness', 'gym', 'exercise', 'workout', 'sağlamlıq'],
      'fitness': ['fitness', 'idman', 'sport', 'gym', 'exercise', 'workout', 'sağlamlıq'],
      'gym': ['gym', 'idman', 'fitness', 'sport', 'exercise', 'workout'],
      'sağlamlıq': ['sağlamlıq', 'health', 'medical', 'hospital', 'doctor', 'həkim'],
      
      // Education & Books - Təhsil və Kitablar
      'təhsil': ['təhsil', 'education', 'school', 'university', 'məktəb', 'universitet'],
      'education': ['education', 'təhsil', 'school', 'university', 'learning', 'study'],
      'kitab': ['kitab', 'book', 'textbook', 'reading', 'oxu', 'study'],
      'book': ['book', 'kitab', 'textbook', 'reading', 'study', 'literature'],
      'məktəb': ['məktəb', 'school', 'education', 'təhsil', 'student', 'şagird'],
      'universitet': ['universitet', 'university', 'college', 'təhsil', 'student'],
      
      // Entertainment - Əyləncə
      'əyləncə': ['əyləncə', 'entertainment', 'fun', 'leisure', 'hobby', 'kino'],
      'kino': ['kino', 'cinema', 'movie', 'film', 'theater', 'əyləncə'],
      'movie': ['movie', 'kino', 'cinema', 'film', 'theater', 'əyləncə'],
      'musiqi': ['musiqi', 'music', 'spotify', 'audio', 'konsert', 'mahnı'],
      'music': ['music', 'musiqi', 'spotify', 'audio', 'streaming', 'song'],
      'konsert': ['konsert', 'concert', 'music', 'musiqi', 'performance', 'show'],
      
      // Travel & Transportation - Səyahət və Nəqliyyat
      'səyahət': ['səyahət', 'travel', 'trip', 'vacation', 'tourism', 'hotel'],
      'travel': ['travel', 'səyahət', 'trip', 'vacation', 'tourism', 'flight'],
      'hotel': ['hotel', 'mehmanxana', 'accommodation', 'booking', 'səyahət'],
      'mehmanxana': ['mehmanxana', 'hotel', 'accommodation', 'booking', 'qalmaq'],
      'uçuş': ['uçuş', 'flight', 'plane', 'airport', 'səyahət', 'aviation'],
      'maşın': ['maşın', 'car', 'auto', 'vehicle', 'avtomobil', 'transport'],
      'car': ['car', 'maşın', 'auto', 'vehicle', 'avtomobil', 'rental'],
      'nəqliyyat': ['nəqliyyat', 'transport', 'transportation', 'bus', 'metro', 'taxi'],
      
      // Shopping & Retail - Alış-veriş
      'alış-veriş': ['alış-veriş', 'shopping', 'mall', 'market', 'mağaza', 'retail'],
      'shopping': ['shopping', 'alış-veriş', 'mall', 'market', 'store', 'buy'],
      'mağaza': ['mağaza', 'store', 'shop', 'retail', 'market', 'alış-veriş'],
      'market': ['market', 'mağaza', 'supermarket', 'grocery', 'food', 'alış-veriş'],
      'mall': ['mall', 'ticarət mərkəzi', 'shopping center', 'mağaza', 'alış-veriş'],
      
      // Home & Furniture - Ev və Mebel
      'ev': ['ev', 'home', 'house', 'apartment', 'mənzil', 'yaşayış'],
      'home': ['home', 'ev', 'house', 'apartment', 'furniture', 'mebel'],
      'mebel': ['mebel', 'furniture', 'ev', 'home', 'interior', 'decoration'],
      'furniture': ['furniture', 'mebel', 'home', 'ev', 'interior', 'decoration'],
      'mətbəx': ['mətbəx', 'kitchen', 'cooking', 'appliance', 'ev'],
      
      // Services - Xidmətlər
      'xidmət': ['xidmət', 'service', 'support', 'help', 'assistance', 'professional'],
      'service': ['service', 'xidmət', 'support', 'help', 'professional', 'business'],
      'təmir': ['təmir', 'repair', 'fix', 'maintenance', 'service', 'xidmət'],
      'bank': ['bank', 'banking', 'finance', 'kredit', 'loan', 'money'],
      'kredit': ['kredit', 'credit', 'loan', 'bank', 'finance', 'money'],
      
      // Popular Brands & Places in Azerbaijan
      'bakı': ['bakı', 'baku', 'capital', 'azerbaijan', 'şəhər'],
      'sumqayıt': ['sumqayıt', 'sumgait', 'city', 'azerbaijan', 'şəhər'],
      'gəncə': ['gəncə', 'ganja', 'city', 'azerbaijan', 'şəhər'],
      'bravo': ['bravo', 'supermarket', 'market', 'grocery', 'alış-veriş'],
      'araz': ['araz', 'supermarket', 'market', 'grocery', 'alış-veriş'],
      'neptun': ['neptun', 'supermarket', 'market', 'grocery', 'alış-veriş'],
      '28 mall': ['28 mall', 'mall', 'shopping', 'alış-veriş', 'ticarət mərkəzi'],
      'port baku': ['port baku', 'mall', 'shopping', 'alış-veriş', 'ticarət mərkəzi'],
      'ganjlik mall': ['ganjlik mall', 'mall', 'shopping', 'alış-veriş', 'ticarət mərkəzi'],
      'park bulvar': ['park bulvar', 'mall', 'shopping', 'alış-veriş', 'ticarət mərkəzi']
    };
  }

  init() {
    this.bus.on('filters:update', (partial) => {
      const state = this.store.get();
      const filters = { ...state.filters, ...partial };
      this.store.update('filters', filters);
      this.applyFilters();
    });

    this.bus.on('search:query', (q) => {
      const state = this.store.get();
      this.store.update('filters', { ...state.filters, search: q });
      this.applyFilters();
    });

    // Allow other modules (e.g., data loader) to request a re-application of filters
    this.bus.on('filters:apply', () => {
      this.applyFilters();
    });

    // Ensure initial sort is applied on startup if data already exists
    this.applyFilters();
  }

  // Expand search query with synonyms
  expandQuery(query) {
    if (!query) return [];
    
    const words = query.toLowerCase().trim().split(/\s+/);
    let expandedTerms = [];
    
    words.forEach(word => {
      expandedTerms.push(word);
      // Check if word exists in synonym keys
      if (this.synonyms[word]) {
        expandedTerms.push(...this.synonyms[word]);
      }
      // Check if word exists as a synonym value
      Object.keys(this.synonyms).forEach(key => {
        if (this.synonyms[key].includes(word) && !expandedTerms.includes(key)) {
          expandedTerms.push(key);
          expandedTerms.push(...this.synonyms[key]);
        }
      });
    });
    
    return [...new Set(expandedTerms)]; // Remove duplicates
  }

  // Calculate relevance score for a discount
  calculateScore(discount, searchTerms) {
    if (!searchTerms.length) return 1;
    
    let score = 0;
    const title = (discount.title || '').toLowerCase();
    const location = (discount.location || '').toLowerCase();
    const description = (discount.description || '').toLowerCase();
    const brand = (discount.brand || '').toLowerCase();
    const keywords = (discount.keywords || []).map(k => k.toLowerCase());
    
    searchTerms.forEach(term => {
      // Exact match in title - highest score
      if (title === term) score += 50;
      else if (title.includes(term)) score += 20;
      
      // Brand match - high score
      if (brand === term) score += 40;
      else if (brand.includes(term)) score += 15;
      
      // Location match
      if (location.includes(term)) score += 10;
      
      // Keywords match
      if (keywords.some(k => k === term)) score += 25;
      else if (keywords.some(k => k.includes(term))) score += 8;
      
      // Description match - lower score
      if (description.includes(term)) score += 5;
    });
    
    return score;
  }

  // Advanced typo handling with multiple algorithms
  fuzzyMatch(query, text, threshold = 0.75) {
    if (!query || !text) return false;
    
    query = query.toLowerCase().trim();
    text = text.toLowerCase().trim();
    
    // Exact match
    if (query === text) return true;
    
    // Contains check
    if (text.includes(query) || query.includes(text)) return true;
    
    // For very short queries, be more strict
    if (query.length <= 2) {
      return text.startsWith(query) || text.includes(query);
    }
    
    // Try multiple fuzzy matching approaches
    return this.levenshteinMatch(query, text, threshold) || 
           this.jaroWinklerMatch(query, text, threshold) ||
           this.ngramMatch(query, text, threshold);
  }

  // Levenshtein distance for character-level typos
  levenshteinMatch(s1, s2, threshold = 0.75) {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  }

  levenshteinDistance(s1, s2) {
    const matrix = Array(s2.length + 1).fill().map(() => Array(s1.length + 1).fill(0));
    
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1,     // deletion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    return matrix[s2.length][s1.length];
  }

  // Jaro-Winkler for better handling of prefix matches
  jaroWinklerMatch(s1, s2, threshold = 0.8) {
    if (s1.length < 3 || s2.length < 3) return false;
    
    const jaro = this.jaroSimilarity(s1, s2);
    if (jaro < 0.7) return false;
    
    // Jaro-Winkler gives more weight to common prefixes
    const prefixLength = this.commonPrefixLength(s1, s2, 4);
    const jaroWinkler = jaro + (0.1 * prefixLength * (1 - jaro));
    
    return jaroWinkler >= threshold;
  }

  jaroSimilarity(s1, s2) {
    if (s1 === s2) return 1;
    
    const len1 = s1.length;
    const len2 = s2.length;
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
    
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, len2);
      
      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = s2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0;
    
    // Find transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
    
    return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  }

  commonPrefixLength(s1, s2, maxLength = 4) {
    const length = Math.min(s1.length, s2.length, maxLength);
    let i = 0;
    while (i < length && s1[i] === s2[i]) i++;
    return i;
  }

  // N-gram matching for keyboard-adjacent typos
  ngramMatch(s1, s2, threshold = 0.6) {
    if (s1.length < 3 || s2.length < 3) return false;
    
    const ngrams1 = this.generateNgrams(s1, 2);
    const ngrams2 = this.generateNgrams(s2, 2);
    
    const intersection = ngrams1.filter(gram => ngrams2.includes(gram));
    const union = [...new Set([...ngrams1, ...ngrams2])];
    
    return intersection.length / union.length >= threshold;
  }

  generateNgrams(str, n) {
    const ngrams = [];
    for (let i = 0; i <= str.length - n; i++) {
      ngrams.push(str.substring(i, i + n));
    }
    return ngrams;
  }

  normalize(str) {
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  applyFilters() {
    const { discounts, filters } = this.store.get();
    const key = JSON.stringify({ filters, count: discounts.length });
    
    const result = this.helpers.memoize(`filters:${key}`, () => {
      const searchQuery = (filters.search || '').trim();
      let list = discounts;

      // Apply category filter
      if (filters.category) {
        list = list.filter(d => d.category === filters.category);
      }

      // Apply location filter
      if (filters.location && filters.location !== 'all') {
        const loc = this.normalize(filters.location);
        list = list.filter(d => this.normalize(d.location).includes(loc));
      }

      // Apply smart search
      if (searchQuery) {
        const expandedTerms = this.expandQuery(searchQuery);
        
        list = list
          .map(discount => ({
            ...discount,
            searchScore: this.calculateScore(discount, expandedTerms)
          }))
          .filter(discount => {
            // Primary search logic
            if (discount.searchScore > 0) return true;
            
            // Fallback: fuzzy matching for typos
            const searchableText = `${discount.title} ${discount.location} ${discount.brand || ''}`.toLowerCase();
            return this.fuzzyMatch(searchQuery, searchableText);
          })
          .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0)); // Sort by relevance first
      }

      // Apply sorting (after search relevance)
      if (!searchQuery || filters.sort !== 'relevance') {
        switch (filters.sort) {
          case 'id':
            list.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
            break;
          case 'highest-rating':
            list.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
            break;
          case 'highest-discount':
          default: {
            const getVal = (s) => parseFloat(String(s || '0').replace('%', '')) || 0;
            list.sort((a, b) => getVal(b.discount_amount) - getVal(a.discount_amount));
          }
        }
      }

      // Remove searchScore from final results (cleanup)
      return list.map(({ searchScore, ...discount }) => discount);
    });

    this.store.set({ filtered: result, page: 1 });
    this.bus.emit('render:list');
  }
}
