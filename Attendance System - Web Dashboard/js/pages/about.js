/**
 * Spark Drives and Automations (SparkDNA) - About Page
 * File: js/pages/about.js
 */

const AboutPage = {
  render() {
    return `
      <section style="padding: 8rem 2rem 4rem 2rem; border-bottom: 1px solid var(--border-color);">
        <div style="max-width: 1000px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; gap: 1rem;">
          <div class="badge-tag" style="align-self: center;">Our Mission</div>
          <h1 class="hero-title" style="font-size: 3rem;">Bridging Hardware & Business Processes</h1>
          <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 700px; margin: 0 auto;">
            Spark Drives and Automations designs rugged industrial electronics and automated tracking systems that streamline operations for MSMEs without costly overheads.
          </p>
        </div>
      </section>

      <!-- Problem vs Solution Section -->
      <section class="section-padding">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
          <div class="card" style="border-left: 4px solid var(--primary-red); background: rgba(199, 0, 17, 0.03);">
            <h3 style="color: #FF8A93; margin-bottom: 1.5rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-exclamation-triangle"></i> The Traditional Challenge
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 1.25rem; font-size: 0.95rem;">
              <li style="display: flex; gap: 10px;">
                <i class="fas fa-times-circle" style="color: #FF8A93; margin-top: 4px;"></i>
                <div>
                  <strong>Buddy Punching:</strong> Paper registers or proximity cards are easily shared, costing factory owners 5-8% in inflated payroll.
                </div>
              </li>
              <li style="display: flex; gap: 10px;">
                <i class="fas fa-times-circle" style="color: #FF8A93; margin-top: 4px;"></i>
                <div>
                  <strong>Messy Manual Worksheets:</strong> Accountants spend hours compiling punch cards, deciphering handwriting, and calculating working hours manually.
                </div>
              </li>
              <li style="display: flex; gap: 10px;">
                <i class="fas fa-times-circle" style="color: #FF8A93; margin-top: 4px;"></i>
                <div>
                  <strong>High Software Subscription Fees:</strong> Modern SaaS HR software charges recurring monthly per-user licensing fees, making it expensive for expanding MSMEs.
                </div>
              </li>
            </ul>
          </div>
          
          <div class="card" style="border-left: 4px solid var(--gold); background: rgba(217, 182, 93, 0.03);">
            <h3 style="color: var(--premium-gold); margin-bottom: 1.5rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-lightbulb"></i> The Spark Solution
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 1.25rem; font-size: 0.95rem;">
              <li style="display: flex; gap: 10px;">
                <i class="fas fa-check-circle" style="color: var(--gold); margin-top: 4px;"></i>
                <div>
                  <strong>Rugged Fingerprint Security:</strong> High-performance optical sensor matches biometric models directly on hardware, completely eliminating fake attendance.
                </div>
              </li>
              <li style="display: flex; gap: 10px;">
                <i class="fas fa-check-circle" style="color: var(--gold); margin-top: 4px;"></i>
                <div>
                  <strong>Auto-Computed Working Hours:</strong> Attendance records compute the time delta between first punch (In) and last punch (Out) automatically inside Google Sheets.
                </div>
              </li>
              <li style="display: flex; gap: 10px;">
                <i class="fas fa-check-circle" style="color: var(--gold); margin-top: 4px;"></i>
                <div>
                  <strong>One-Time Investment, Free Cloud:</strong> Uses Google Sheets as a database and Apps Script as API layer, meaning zero subscription fees.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Architecture Flow Section -->
      <section style="background: #090C14; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);" class="section-padding">
        <div class="section-header">
          <div class="badge-tag" style="margin-bottom: 1rem;">System Topography</div>
          <h2 class="section-title">Ecosystem Architecture</h2>
          <p class="section-desc">Understand the end-to-end data flow between hardware components and the administrator dashboard.</p>
        </div>
        <div style="max-width: 900px; margin: 0 auto; background: var(--surface-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-premium);">
          <img src="assets/images/architecture.jpeg" alt="Ecosystem Architecture Flow Diagram" style="width: 100%; border-radius: 8px; display: block;">
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; max-width: 900px; margin: 2.5rem auto 0 auto; text-align: center;">
          <div>
            <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;">ESP32 Controller</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Scans biometric, drives HMI display, triggers gate opening relay.</p>
          </div>
          <div>
            <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;">Google Apps Script</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Exposes REST endpoints. Validates device tokens and acts as middleware.</p>
          </div>
          <div>
            <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;">Google Sheets</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Acts as the spreadsheet database storage, completely visible to company owners.</p>
          </div>
          <div>
            <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem;">Web Dashboard</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Visualizes statistics, updates employee rosters, and manages leaves.</p>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="section-padding">
        <div class="section-header">
          <div class="badge-tag" style="background: rgba(217, 182, 93, 0.1); border-color: rgba(217, 182, 93, 0.3); color: var(--premium-gold); margin-bottom: 1rem;">Core Benefits</div>
          <h2 class="section-title">Designed for Business Efficiency</h2>
          <p class="section-desc">Why factory owners and managers select SparkDNA systems over traditional SaaS offerings.</p>
        </div>
        <div class="features-grid">
          <div class="card">
            <i class="fas fa-bullseye feature-icon" style="color: var(--primary-red);"></i>
            <h3 style="margin-bottom: 0.75rem;">100% Accuracy</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">No card sharing or manual register padding. Biometric scanners verify the actual physical presence of the workforce.</p>
          </div>
          <div class="card">
            <i class="fas fa-robot feature-icon" style="color: var(--primary-red);"></i>
            <h3 style="margin-bottom: 0.75rem;">Full Automation</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Punches log automatically, overtime parameters compute via sheets macros, and approvals sync directly to payroll books.</p>
          </div>
          <div class="card">
            <i class="fas fa-chart-line feature-icon" style="color: var(--primary-red);"></i>
            <h3 style="margin-bottom: 0.75rem;">Actionable Analytics</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">View attendance heatmaps, identify department-wide bottlenecks, and check who is late, all inside one dashboard.</p>
          </div>
        </div>
      </section>
    `;
  },
  
  init() {
    // No special JS hooks needed for about page
  }
};

window.aboutPage = AboutPage;
