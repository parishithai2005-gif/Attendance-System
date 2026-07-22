/**
 * Spark Drives and Automations (SparkDNA) - Home Page
 * File: js/pages/home.js
 */

const HomePage = {
  render() {
    return `
      <!-- Hero Section -->
      <section class="hero">
        <video class="hero-bg-video" autoplay loop muted playsinline>
          <source src="assets/videos/hero_video.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="badge-tag">
              <i class="fas fa-microchip"></i> Industrial Grade Solutions
            </div>
            <h1 class="hero-title">
              Industrial Workforce <br><span>Automation Powered</span><br> by Biometrics
            </h1>
            <p class="hero-subheadline">
              Automate attendance, workforce tracking and employee analytics using Spark's integrated biometric ecosystem. Built for MSMEs.
            </p>
            <div class="hero-actions">
              <a href="#/contact" class="btn btn-primary">Book Demo <i class="fas fa-calendar-alt"></i></a>
              <a href="#/products" class="btn btn-secondary">View Products <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="visual-container">
              <img src="assets/images/admin_dashboard.jpeg" class="visual-img" alt="SparkDNA Dashboard Mockup">
              <!-- Glow and badges -->
              <div style="position: absolute; bottom: -15px; right: -15px; background: #111827; border: 1px solid var(--gold); padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-premium);">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; display: inline-block; animation: pulse 1s infinite alternate;"></span>
                <span style="font-size: 0.75rem; font-weight: 700; color: #FFF; font-family: var(--font-heading);">ESP32 Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Metrics Section -->
      <section style="background: rgba(17, 24, 39, 0.4); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
        <div class="section-padding">
          <div class="metrics-grid">
            <div class="card" style="text-align: center;">
              <div class="metric-num" data-val="150">0</div>
              <div class="metric-lbl">Deployments</div>
            </div>
            <div class="card" style="text-align: center;">
              <div class="metric-num" data-val="12000">0</div>
              <div class="metric-lbl">Daily Active Scans</div>
            </div>
            <div class="card" style="text-align: center;">
              <div class="metric-num" data-val="99">0</div>
              <div class="metric-lbl">Uptime %</div>
            </div>
            <div class="card" style="text-align: center;">
              <div class="metric-num" data-val="60">0</div>
              <div class="metric-lbl">Mins Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Company Overview Section -->
      <section class="section-padding">
        <div class="product-showcase-grid">
          <div>
            <div class="badge-tag" style="background: rgba(217, 182, 93, 0.1); border-color: rgba(217, 182, 93, 0.3); color: var(--premium-gold); margin-bottom: 1rem;">
              Company Overview
            </div>
            <h2 class="section-title" style="text-align: left; margin-bottom: 1.5rem;">
              Engineered for Industrial Reliability
            </h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
              Traditional SaaS payroll products are built for air-conditioned office staff. Spark Drives and Automations designs systems specifically for factory floors, workshops, and heavy machinery sites.
            </p>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">
              We unify physical IoT controllers (ESP32), HMI touch screens, secure biometric optical sensors, and Google Workspace sheets into an instantly deployable workflow tracker. Zero servers, zero maintenance, complete control.
            </p>
            <a href="#/about" class="btn btn-secondary">Read Our Story</a>
          </div>
          <div style="position: relative;">
            <div class="card" style="padding: 1rem; border-color: rgba(217, 182, 93, 0.2);">
              <img src="assets/images/architecture.jpeg" alt="Hardware Infrastructure" style="width: 100%; border-radius: 8px; display: block;">
            </div>
          </div>
        </div>
      </section>

      <!-- Key Features Section -->
      <section style="background: #090C14; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
        <div class="section-padding">
          <div class="section-header">
            <div class="badge-tag" style="margin-bottom: 1rem;">Enterprise Infrastructure</div>
            <h2 class="section-title">Robust Features Built for MSMEs</h2>
            <p class="section-desc">Full-featured management platform without the complexity or licensing costs of bloated ERP systems.</p>
          </div>
          <div class="features-grid">
            <div class="card">
              <i class="fas fa-fingerprint feature-icon"></i>
              <h3 style="margin-bottom: 0.75rem;">Biometric Attendance</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">High-accuracy fingerprint scanning prevents buddy punching and handles grease, dust, and moisture in workshop settings.</p>
            </div>
            <div class="card">
              <i class="fas fa-sync feature-icon"></i>
              <h3 style="margin-bottom: 0.75rem;">Google Sheets Sync</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Complete database synchronization. Maintain, view, and modify your employee list directly inside Google Sheets.</p>
            </div>
            <div class="card">
              <i class="fas fa-tachometer-alt feature-icon"></i>
              <h3 style="margin-bottom: 0.75rem;">HMI Display Panel</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Provides clear audio-visual feedback at entry gates, displaying daily welcome messages and on-screen login status.</p>
            </div>
            <div class="card">
              <i class="fas fa-clock feature-icon"></i>
              <h3 style="margin-bottom: 0.75rem;">Real-time Analytics</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Track metrics like Late Entries, average working hours, and department percentage directly from the administrator dashboard.</p>
            </div>
            <div class="card">
              <i class="fas fa-calendar-check feature-icon"></i>
              <h3 style="margin-bottom: 0.75rem;">On-Duty Management</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Allow field service engineers and operators to submit location-tagged on-duty logs, synced instantly to sheets.</p>
            </div>
            <div class="card">
              <i class="fas fa-user-shield feature-icon"></i>
              <h3 style="margin-bottom: 0.75rem;">Enterprise Security</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Authentication via Google OAuth API. Credentials and records are securely stored under custom sheets without sheet url exposures.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="section-padding">
        <div class="section-header">
          <div class="badge-tag" style="background: rgba(217, 182, 93, 0.1); border-color: rgba(217, 182, 93, 0.3); color: var(--premium-gold); margin-bottom: 1rem;">Process Flow</div>
          <h2 class="section-title">How the Ecosystem Works</h2>
          <p class="section-desc">Four unified components bridging industrial hardware and standard business automation tools.</p>
        </div>
        <div class="timeline">
          <div class="timeline-item left">
            <div class="timeline-content">
              <div class="timeline-step">Step 1</div>
              <h4 style="margin: 0.5rem 0;">Optical Scan & Feedback</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Employee scans fingerprint on the optical sensor. The ESP32 controller matches ID and displays punch status on the HMI screen.</p>
            </div>
          </div>
          <div class="timeline-item right">
            <div class="timeline-content">
              <div class="timeline-step">Step 2</div>
              <h4 style="margin: 0.5rem 0;">Secure Script Forwarding</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">The ESP32 submits a REST request to a secure Google Apps Script Web App. Sheets URLs are hidden from the hardware client.</p>
            </div>
          </div>
          <div class="timeline-item left">
            <div class="timeline-content">
              <div class="timeline-step">Step 3</div>
              <h4 style="margin: 0.5rem 0;">Google Sheets database log</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Apps Script validates inputs and logs the punch event, computing hours worked dynamically. The cell values are saved immediately.</p>
            </div>
          </div>
          <div class="timeline-item right">
            <div class="timeline-content">
              <div class="timeline-step">Step 4</div>
              <h4 style="margin: 0.5rem 0;">Analytics Dashboard Sync</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">The Admin Portal fetches and visualizes data through Apps Script. Interactive charts and logs are updated instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Industries Served -->
      <section style="background: #090C14; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);" class="section-padding">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
          <div>
            <div class="badge-tag" style="margin-bottom: 1rem;">Adaptable Design</div>
            <h2 class="section-title" style="text-align: left; margin-bottom: 1.5rem;">Industries We Serve</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
              Spark Drives and Automations works closely with SMEs across manufacturing, logistics, and processing fields.
            </p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
              <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
                <i class="fas fa-check-circle" style="color: var(--gold);"></i> <strong>Forging & Metal Casting:</strong> High-heat optical sensors.
              </li>
              <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
                <i class="fas fa-check-circle" style="color: var(--gold);"></i> <strong>Assembly & Production Lines:</strong> Live terminal updates.
              </li>
              <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
                <i class="fas fa-check-circle" style="color: var(--gold);"></i> <strong>Warehouses & Logistics:</strong> On-duty tracking for operators.
              </li>
              <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
                <i class="fas fa-check-circle" style="color: var(--gold);"></i> <strong>Chemical & Processing Plants:</strong> Rugged enclosures.
              </li>
            </ul>
          </div>
          <div>
            <img src="assets/images/product.jpeg" alt="Industrial environment biometric terminals" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="section-padding">
        <div class="section-header">
          <div class="badge-tag" style="background: rgba(217, 182, 93, 0.1); border-color: rgba(217, 182, 93, 0.3); color: var(--premium-gold); margin-bottom: 1rem;">Case Studies</div>
          <h2 class="section-title">Trusted on the Factory Floor</h2>
          <p class="section-desc">Read reviews from production managers and proprietors who replaced traditional payroll with Spark.</p>
        </div>
        <div class="features-grid">
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <p style="color: var(--text-muted); font-style: italic; font-size: 0.95rem; margin-bottom: 1.5rem;">
              "Spark's biometric units have survived the dusty environment of our casting furnace shop for 18 months now. The direct Google Sheets sync saved our accountant 5 days of manual logging every month!"
            </p>
            <div>
              <strong style="color: var(--premium-gold); display: block; font-size: 0.9rem;">Manoj Patwardhan</strong>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Director, Patwardhan Castings Pvt Ltd</span>
            </div>
          </div>
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <p style="color: var(--text-muted); font-style: italic; font-size: 0.95rem; margin-bottom: 1.5rem;">
              "The on-duty request feature works perfectly for our client deployment teams. They submit logs from client factories, and we approve them with a single click. Excellent ROI."
            </p>
            <div>
              <strong style="color: var(--premium-gold); display: block; font-size: 0.9rem;">Sunitha Pillai</strong>
              <span style="font-size: 0.8rem; color: var(--text-muted);">HR Manager, Precision Assemblies</span>
            </div>
          </div>
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <p style="color: var(--text-muted); font-style: italic; font-size: 0.95rem; margin-bottom: 1.5rem;">
              "Being an MSME, we didn't want to invest in expensive ERP systems. Spark's solution uses our existing Google Sheets structure, making it highly customizable for our shift timings."
            </p>
            <div>
              <strong style="color: var(--premium-gold); display: block; font-size: 0.9rem;">Harpreet Singh</strong>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Proprietor, Singh Forgings & Dies</span>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section style="background: linear-gradient(135deg, rgba(147, 0, 12, 0.4) 0%, rgba(11, 15, 25, 0.9) 100%); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);" class="section-padding">
        <div style="text-align: center; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
          <h2 style="font-size: 2.5rem; color: #FFF; font-family: var(--font-heading);">Ready to Automate Your Workforce?</h2>
          <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 600px;">
            Get in touch for a custom quote, on-site feasibility evaluation, and hardware installation options.
          </p>
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <a href="#/contact" class="btn btn-primary btn-gold">Contact Sales <i class="fas fa-envelope"></i></a>
            <a href="#/contact" class="btn btn-secondary">Request Call <i class="fas fa-phone-alt"></i></a>
          </div>
        </div>
      </section>
    `;
  },

  init() {
    // Dynamic counter animation
    const counters = document.querySelectorAll('.metric-num');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-val'), 10);
      let current = 0;
      const step = Math.ceil(target / 50); // Increment speed
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = target + (target === 99 ? '%' : '+');
          clearInterval(timer);
        } else {
          counter.textContent = current + '+';
        }
      }, 30);
    });
  }
};

window.homePage = HomePage;
