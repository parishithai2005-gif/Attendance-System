/**
 * Spark Drives and Automations (SparkDNA) - Products Page
 * File: js/pages/products.js
 */

const ProductsPage = {
  render() {
    return `
      <section style="padding: 8rem 2rem 4rem 2rem; border-bottom: 1px solid var(--border-color);">
        <div style="max-width: 1000px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; gap: 1rem;">
          <div class="badge-tag" style="align-self: center;">Hardware Catalog</div>
          <h1 class="hero-title" style="font-size: 3rem;">Industrial Biometric Terminals</h1>
          <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 700px; margin: 0 auto;">
            Industrial-grade biometric hardware designed to survive high temperatures, dust, vibration, and continuous operations on MSME factory floors.
          </p>
        </div>
      </section>

      <!-- Main Product Showcase -->
      <section class="section-padding">
        <div class="product-showcase-grid">
          <div>
            <img src="assets/images/product.jpeg" alt="Spark Bio-Gate Pro Device" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
          </div>
          <div>
            <div class="badge-tag" style="margin-bottom: 1rem;">Flagship Model</div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem; font-family: var(--font-heading);">Spark Bio-Gate Pro</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
              Our flagship wall-mountable terminal features a high-speed optical fingerprint reader and an HMI capacitive touch screen. Ideal for heavy manufacturing plants, gates, and warehouse doors.
            </p>
            
            <table class="specs-table">
              <tr>
                <td>Controller</td>
                <td>ESP32-WROOM-32D Dual-Core 240MHz</td>
              </tr>
              <tr>
                <td>Biometric Sensor</td>
                <td>High-resolution R307 Optical Sensor</td>
              </tr>
              <tr>
                <td>Display Panel</td>
                <td>3.5" HMI Smart Touch Panel</td>
              </tr>
              <tr>
                <td>User Storage Capacity</td>
                <td>Up to 1,000 Fingerprint Profiles (offline cache)</td>
              </tr>
              <tr>
                <td>Connectivity</td>
                <td>Dual-Band Wi-Fi + Optional RJ45 Ethernet</td>
              </tr>
              <tr>
                <td>Enclosure</td>
                <td>IP54 Dustproof & Rust-protected Mild Steel</td>
              </tr>
              <tr>
                <td>Input Power</td>
                <td>12V DC / PoE (Power over Ethernet) support</td>
              </tr>
              <tr>
                <td>Integrations</td>
                <td>Relay Gates (12V/24V), Alarm Sirens, Handoff API</td>
              </tr>
            </table>

            <a href="#/contact" class="btn btn-primary btn-gold" style="margin-top: 1rem;">Get Price Quote <i class="fas fa-file-invoice-dollar"></i></a>
          </div>
        </div>
      </section>

      <!-- Product Lineup Grid (Comparison) -->
      <section style="background: #090C14; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);" class="section-padding">
        <div class="section-header">
          <div class="badge-tag" style="margin-bottom: 1rem;">Product Models</div>
          <h2 class="section-title">Select the Right Setup</h2>
          <p class="section-desc">We manufacture different configurations to match your budget and gate constraints.</p>
        </div>

        <div class="features-grid">
          <!-- Card 1 -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <div>
              <div style="background: rgba(199, 0, 17, 0.1); border: 1px solid rgba(199, 0, 17, 0.3); border-radius: 4px; padding: 4px 8px; display: inline-block; font-size: 0.75rem; font-weight: 700; color: #FF8A93; text-transform: uppercase; margin-bottom: 1rem;">
                Standard
              </div>
              <h3 style="margin-bottom: 0.75rem; font-family: var(--font-heading);">Spark Bio-Entry Mini</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                Compact attendance logger with an alphanumeric 16x2 LCD feedback display. Designed for indoor production floors, server rooms, and supervisor desks.
              </p>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem;">
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> ESP32 Wi-Fi module</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> 500 Employee capacity</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> ABS Industrial Plastic case</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> LED + Buzzer notifications</li>
              </ul>
            </div>
            <a href="#/contact" class="btn btn-secondary" style="width: 100%;">Enquire Now</a>
          </div>

          <!-- Card 2 -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; border-color: var(--gold); box-shadow: 0 10px 30px rgba(217, 182, 93, 0.08);">
            <div style="position: absolute; top: -12px; right: 20px; background: var(--gold); color: var(--dark-bg); font-size: 0.75rem; font-weight: 800; padding: 2px 10px; border-radius: 100px; text-transform: uppercase;">
              Best Seller
            </div>
            <div>
              <div style="background: rgba(217, 182, 93, 0.15); border: 1px solid rgba(217, 182, 93, 0.3); border-radius: 4px; padding: 4px 8px; display: inline-block; font-size: 0.75rem; font-weight: 700; color: var(--premium-gold); text-transform: uppercase; margin-bottom: 1rem;">
                Heavy Duty
              </div>
              <h3 style="margin-bottom: 0.75rem; font-family: var(--font-heading);">Spark Bio-Gate Pro</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                Complete gateway access control including a full 3.5" HMI touch display, automatic relays for turnstiles/solenoids, and real-time offline-to-online sync.
              </p>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem;">
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Dual core ESP32 chip</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> 1000 Employee capacity</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Rust-free steel IP54 casing</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Relay solenoid trigger</li>
              </ul>
            </div>
            <a href="#/contact" class="btn btn-primary" style="width: 100%;">Enquire Now</a>
          </div>

          <!-- Card 3 -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <div>
              <div style="background: rgba(156, 163, 175, 0.1); border: 1px solid rgba(156, 163, 175, 0.3); border-radius: 4px; padding: 4px 8px; display: inline-block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem;">
                Custom OEM
              </div>
              <h3 style="margin-bottom: 0.75rem; font-family: var(--font-heading);">Spark Biometric OEM Kit</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                Raw hardware board layout, pre-programmed ESP32 microchip, scanner modules, and APIs. Designed for machinery integrators and panel builders.
              </p>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem;">
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Bare board, terminal blocks</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Custom firmware loading</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Modbus / RS485 communication</li>
                <li><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 5px;"></i> Apps Script template code</li>
              </ul>
            </div>
            <a href="#/contact" class="btn btn-secondary" style="width: 100%;">Enquire Now</a>
          </div>
        </div>
      </section>

      <!-- Connection Features / Technical -->
      <section class="section-padding">
        <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem; font-family: var(--font-heading);">Engineered for Seamless Integration</h2>
          <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 3rem auto;">
            Our terminals communicate over lightweight HTTP, translating raw optical readings into direct database columns instantly.
          </p>
          <div class="features-grid">
            <div class="card" style="text-align: left;">
              <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;"><i class="fas fa-wifi" style="margin-right: 8px;"></i> Dual Connectivity</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Equipped with high-sensitivity Wi-Fi antennas. Optional Ethernet expansion ensures communication stays active even in metal-clad industrial sheds.</p>
            </div>
            <div class="card" style="text-align: left;">
              <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;"><i class="fas fa-database" style="margin-right: 8px;"></i> Local Matching cache</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Fingerprint matching happens directly on the device within 0.8s. In case of internet dropouts, punches are cached locally and synced automatically when Wi-Fi returns.</p>
            </div>
            <div class="card" style="text-align: left;">
              <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;"><i class="fas fa-shield-alt" style="margin-right: 8px;"></i> Safe Biometric Hashing</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Raw image scans are never stored. Fingerprints are mathematically hashed into minor coordinate models, ensuring complete privacy and security.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  init() {
    // No special JS hooks needed for products page
  }
};

window.productsPage = ProductsPage;
