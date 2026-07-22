/**
 * Spark Drives and Automations (SparkDNA) - App Controller & Router
 * File: js/app.js
 */

const AppRouter = {
  routes: {
    'home': window.homePage,
    'about': window.aboutPage,
    'products': window.productsPage,
    'admin': window.adminPage,
    'faq': window.faqPage,
    'contact': window.contactPage
  },

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // Initial routing load
    this.handleRouting();

    // Setup Mobile hamburger menu
    this.setupMobileMenu();
    
    // Load database connection banner state
    this.updateConnectionBanner();
  },

  handleRouting() {
    // Parse route hash (e.g., '#/about' -> 'about')
    let hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    
    if (!hash || !this.routes[hash]) {
      // Default fallback
      hash = 'home';
      window.location.hash = '#/home';
      return;
    }

    const page = this.routes[hash];
    const container = document.getElementById('appContentContainer');
    
    if (container && page) {
      // 1. Inject HTML markup
      container.innerHTML = page.render();
      
      // 2. Trigger lifecycle init callbacks
      if (typeof page.init === 'function') {
        page.init();
      }

      // 3. Update active nav menu link highlights
      this.updateActiveNavLinks(hash);

      // 4. Scroll page to top on route change
      window.scrollTo(0, 0);

      // 5. Hide mobile menu drawer if open
      const menu = document.getElementById('navMenu');
      if (menu) menu.classList.remove('active');
    }
  },

  updateActiveNavLinks(route) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(route)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  setupMobileMenu() {
    const toggle = document.getElementById('hamburgerToggle');
    const menu = document.getElementById('navMenu');

    if (toggle && menu) {
      toggle.onclick = () => {
        menu.classList.toggle('active');
      };
    }
  },

  updateConnectionBanner() {
    const banner = document.getElementById('appConnectionBanner');
    if (banner) {
      const isConnected = window.sparkApi.isConnectedToSheets();
      if (isConnected) {
        banner.className = 'connection-banner connected';
        banner.innerHTML = `
          <div class="connection-status">
            <span class="status-dot"></span>
            <span>LIVE SHEET INTEGRATION ACTIVE</span>
          </div>
          <div>SparkDNA Apps Script Web API</div>
        `;
      } else {
        banner.className = 'connection-banner';
        banner.innerHTML = `
          <div class="connection-status">
            <span class="status-dot"></span>
            <span>RUNNING IN SIMULATED LOCAL DEMO MODE</span>
          </div>
          <a href="#/admin?tab=settings" style="color: var(--gold); text-decoration: underline; font-weight:700;">[Connect Google Sheet]</a>
        `;
      }
    }
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});
