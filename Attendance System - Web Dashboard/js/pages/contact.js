/**
 * Spark Drives and Automations (SparkDNA) - Contact Page
 * File: js/pages/contact.js
 */

const ContactPage = {
  render() {
    return `
      <section style="padding: 8rem 2rem 4rem 2rem; border-bottom: 1px solid var(--border-color);">
        <div style="max-width: 1000px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; gap: 1rem;">
          <div class="badge-tag" style="align-self: center;">Get in Touch</div>
          <h1 class="hero-title" style="font-size: 3rem;">Connect with Automation Experts</h1>
          <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 600px; margin: 0 auto;">
            Inquire about pricing, request custom firmware setups, or schedule a physical installation evaluation on your shop floor.
          </p>
        </div>
      </section>

      <section class="section-padding">
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 4rem;">
          <!-- Contact Info -->
          <div>
            <h2 style="font-family: var(--font-heading); margin-bottom: 2rem;">Contact Information</h2>
            
            <div style="display: flex; flex-direction: column; gap: 2rem;">
              <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="background: rgba(199, 0, 17, 0.1); border: 1px solid rgba(199, 0, 17, 0.2); padding: 12px; border-radius: 8px; color: var(--primary-red); font-size: 1.25rem;">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h4 style="color: var(--premium-gold); margin-bottom: 0.25rem;">Spark Factory Headquarters</h4>
                  <p style="color: var(--text-muted); font-size: 0.9rem;">
                    44, Marvel Parambariyam, Opposite SMS Mahal,<br>
                    Kalapatti-Vilanguruchi Road, PO, Saravanampatti,<br>
                    Coimbatore, Tamil Nadu 641035
                  </p>
                </div>
              </div>

              <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="background: rgba(199, 0, 17, 0.1); border: 1px solid rgba(199, 0, 17, 0.2); padding: 12px; border-radius: 8px; color: var(--primary-red); font-size: 1.25rem;">
                  <i class="fas fa-phone-alt"></i>
                </div>
                <div>
                  <h4 style="color: var(--premium-gold); margin-bottom: 0.25rem;">Direct Sales Lines</h4>
                  <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">+91 20 2712 9845 (Office)</p>
                  <p style="color: var(--text-muted); font-size: 0.9rem;">+91 94223 84901 (Installation Support)</p>
                </div>
              </div>

              <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="background: rgba(199, 0, 17, 0.1); border: 1px solid rgba(199, 0, 17, 0.2); padding: 12px; border-radius: 8px; color: var(--primary-red); font-size: 1.25rem;">
                  <i class="fas fa-envelope"></i>
                </div>
                <div>
                  <h4 style="color: var(--premium-gold); margin-bottom: 0.25rem;">Corporate Mailboxes</h4>
                  <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">sales@sparkdrives.in (Inquiries)</p>
                  <p style="color: var(--text-muted); font-size: 0.9rem;">support@sparkdna.com (Support)</p>
                </div>
              </div>
            </div>

            <!-- Business Hours Card -->
            <div class="card" style="margin-top: 3rem; background: rgba(217, 182, 93, 0.02); border-color: rgba(217, 182, 93, 0.15);">
              <h4 style="color: var(--premium-gold); margin-bottom: 0.5rem; font-family: var(--font-heading);">Factory Working Hours</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Monday – Saturday: 08:30 AM – 06:30 PM (IST)</p>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Sunday: Closed (Support via ticketing online)</p>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="card">
            <h3 style="font-family: var(--font-heading); margin-bottom: 1.5rem;">Request Demo / Callback</h3>
            
            <div id="contactFormAlertContainer"></div>

            <form id="sparkContactForm">
              <div class="form-group">
                <label for="contactName">Proprietor / Contact Person Name *</label>
                <input type="text" id="contactName" class="form-control" placeholder="Enter full name" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="contactEmail">Business Email *</label>
                  <input type="email" id="contactEmail" class="form-control" placeholder="name@company.com" required>
                </div>
                <div class="form-group">
                  <label for="contactPhone">Mobile Number *</label>
                  <input type="tel" id="contactPhone" class="form-control" placeholder="+91 XXXXX XXXXX" required>
                </div>
              </div>

              <div class="form-group">
                <label for="contactCompany">Company / MSME Name *</label>
                <input type="text" id="contactCompany" class="form-control" placeholder="Company Name Pvt Ltd" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="contactSize">Roster Size (Employees)</label>
                  <select id="contactSize" class="form-control" style="background: #0B0F19;">
                    <option value="1-15">1 – 15 employees</option>
                    <option value="16-50">16 – 50 employees</option>
                    <option value="51-150">51 – 150 employees</option>
                    <option value="150+">More than 150 employees</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="contactHardware">Hardware Enclosures</label>
                  <select id="contactHardware" class="form-control" style="background: #0B0F19;">
                    <option value="BioGate Pro">Spark Bio-Gate Pro (Flagship)</option>
                    <option value="BioEntry Mini">Spark Bio-Entry Mini</option>
                    <option value="OEM Kit">Custom OEM Panel Kit</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="contactMsg">Message / Specific Requirements</label>
                <textarea id="contactMsg" class="form-control" rows="4" placeholder="Let us know about your gate/turnstile setups, shift rules, or sheet layout requirements..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-gold" style="width: 100%; margin-top: 1rem;">Submit Inquiry <i class="fas fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
      </section>
    `;
  },

  init() {
    const form = document.getElementById('sparkContactForm');
    const alertContainer = document.getElementById('contactFormAlertContainer');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const company = document.getElementById('contactCompany').value.trim();
        const rosterSize = document.getElementById('contactSize').value;
        const hardware = document.getElementById('contactHardware').value;
        const message = document.getElementById('contactMsg').value.trim();

        alertContainer.innerHTML = `<span style="color:var(--gold); font-size:0.85rem;"><i class="fas fa-spinner fa-spin"></i> Submitting inquiry...</span>`;

        try {
          const res = await window.sparkApi.submitContactInquiry({
            'Contact Person Name': name,
            'Business Email': email,
            'Mobile Number': phone,
            'Company Name': company,
            'Employee Size': rosterSize,
            'Product Required': hardware,
            'Requirement Details': message
          });

          if (res.status === 'success') {
            alertContainer.innerHTML = `
              <div class="alert alert-success">
                <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                <strong>Thank you, ${name}!</strong> Your demo request for ${company} has been registered successfully. One of our engineers will call you within 2 business hours.
              </div>
            `;
            form.reset();
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">Failed to submit: ${res.message}</div>`;
          }
        } catch (err) {
          alertContainer.innerHTML = `<div class="alert alert-danger">Error submitting inquiry: ${err.message || err}</div>`;
        }

        // Scroll slightly up to see alert
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }
};

window.contactPage = ContactPage;
