/**
 * Spark Drives and Automations (SparkDNA) - FAQ Page
 * File: js/pages/faq.js
 */

const FaqPage = {
  faqs: [
    {
      category: 'security',
      question: 'Is my employee\'s biometric data safe?',
      answer: 'Yes, absolutely. The optical fingerprint scanners do not store raw images of fingerprints. They extract key minutiae points and convert them into a secure, irreversible mathematical hash. This hash cannot be reverse-engineered back into a fingerprint image, ensuring complete data privacy.'
    },
    {
      category: 'hardware',
      question: 'What happens if the factory internet or Wi-Fi goes down?',
      answer: 'Our terminals are designed with offline cache logic. When Wi-Fi is unavailable, biometric matching still occurs locally to allow gate/door release, and punches are cached locally. Once the network is restored, the device auto-syncs the logs to Google Sheets, preserving the exact punch timestamps.'
    },
    {
      category: 'hardware',
      question: 'How does the system handle greasy, dusty, or wet fingers on the shop floor?',
      answer: 'We deploy high-quality optical sensors with advanced sensing glass. However, for extreme industrial environments (like forge shops or oil mills), we recommend workers wipe their fingers. In addition, the system allows up to 3 fingerprint templates per employee, enabling backup logs (e.g., index, middle, and thumb).'
    },
    {
      category: 'database',
      question: 'Do we need a dedicated server to store attendance data?',
      answer: 'No. The Spark biometric ecosystem runs serverless. It connects directly to your Google Workspace account. Your data is stored in standard Google Sheet files, saving you expensive server hosting costs and SQL database maintenance.'
    },
    {
      category: 'features',
      question: 'How is the daily working hours calculation performed?',
      answer: 'The backend tracks the time delta between the first punch of the day (Punch-In) and the last punch of the day (Punch-Out). When a punch out is logged, the Apps Script calculates the hours as a decimal (e.g., 8.5 hours) and writes it into the sheet immediately.'
    },
    {
      category: 'features',
      question: 'Can the system track different shifts (including night shifts)?',
      answer: 'Yes. By custom configuring the Sheets formulas or using our standard template, punches recorded past midnight are automatically grouped to the correct shift block of the previous calendar day, ensuring accurate billing cycles for 24/7 manufacturing plants.'
    },
    {
      category: 'features',
      question: 'How do on-duty requests work for field staff?',
      answer: 'The administrator can log On-Duty requests directly on behalf of employees in the On-Duty tab of the Admin Portal. Once created, the request status can be approved, which automatically writes a pre-set attendance log (09:00:00 to 17:30:00) with "On-Duty" status, preventing payroll deductions.'
    },
    {
      category: 'database',
      question: 'Is there any monthly subscription or licensing fee?',
      answer: 'No. We follow a hardware-first model. The purchase of the Spark biometric terminal includes the system firmware and standard spreadsheet web dashboards. There are zero monthly user license fees or hosting bills.'
    },
    {
      category: 'security',
      question: 'Is our Google Sheets URL visible to the hardware device?',
      answer: 'No. For security, sheets credentials and file URLs are never stored on the hardware devices (ESP32). The terminal only knows the REST endpoint of the Google Apps Script Web App. The script validates requests internally and acts as a gateway.'
    },
    {
      category: 'hardware',
      question: 'How many fingerprints can a single device store?',
      answer: 'The standard Spark Bio-Gate Pro cache stores up to 1,000 unique fingerprint models locally. If your workforce is larger, we offer capacitive modules that expand capacity to 3,000 models.'
    },
    {
      category: 'hardware',
      question: 'What is the power requirement for Spark Bio-Gate Pro?',
      answer: 'The terminal requires a standard 12V DC power source. We supply a heavy-duty industrial adapter. It can also be powered over Ethernet (PoE) for clean cabling or connected to a 12V battery backup in areas with frequent power outages.'
    },
    {
      category: 'database',
      question: 'Can a single spreadsheet connect to multiple biometric terminals?',
      answer: 'Yes, definitely. Multiple devices placed at different entry/exit gates can submit punches to the same Apps Script API. The script resolves and logs all entries based on the employee ID.'
    },
    {
      category: 'features',
      question: 'How are late entries flagged?',
      answer: 'The administrator sets the Grace Time (e.g., 09:15:00). Any check-in recorded after this time is automatically marked with the "Late" badge, notifying supervisors on their dynamic panels.'
    },
    {
      category: 'database',
      question: 'Can we export reports to Excel or CSV?',
      answer: 'Yes. The Administrator Portal provides direct "Export CSV" and "Export Excel" buttons on the Attendance logs and Employee lists. This lets you generate files locally without opening Google Sheets.'
    },
    {
      category: 'hardware',
      question: 'What is the warranty period for Spark biometric hardware?',
      answer: 'Every terminal comes with a 1-year standard replacement warranty. We also offer Annual Maintenance Contracts (AMC) that cover on-site calibration, optical glass cleanings, and firmware updates.'
    },
    {
      category: 'features',
      question: 'How do we enroll new employees into the fingerprint scanner database?',
      answer: 'Enrolling is simple: 1. Add the employee details in the Administrator Portal to generate their unique ID. 2. Put the biometric terminal into "Enroll Mode" via the touchscreen. 3. Input their generated ID. 4. Have the employee press their finger twice. The device registers the hash locally and pushes it to the database.'
    }
  ],

  render() {
    return `
      <section style="padding: 8rem 2rem 4rem 2rem; border-bottom: 1px solid var(--border-color);">
        <div style="max-width: 1000px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; gap: 1rem;">
          <div class="badge-tag" style="align-self: center;">Help Center</div>
          <h1 class="hero-title" style="font-size: 3rem;">Frequently Asked Questions</h1>
          <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 600px; margin: 0 auto;">
            Search our comprehensive documentation to find answers regarding security, hardware operations, and Google Sheets integration.
          </p>
          
          <div class="table-search-box" style="margin: 2rem auto 0 auto; width: 100%; max-width: 500px;">
            <i class="fas fa-search"></i>
            <input type="text" id="faqSearchInput" class="form-control" placeholder="Search FAQs (e.g. Wi-Fi, Privacy, Shift)...">
          </div>
        </div>
      </section>

      <!-- FAQ Items Section -->
      <section class="section-padding">
        <div class="faq-accordion" id="faqAccordionContainer">
          <!-- Dynamically Rendered FAQs -->
        </div>
      </section>
    `;
  },

  init() {
    this.renderFaqs(this.faqs);

    // Filter Logic
    const searchInput = document.getElementById('faqSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = this.faqs.filter(faq => 
          faq.question.toLowerCase().includes(query) || 
          faq.answer.toLowerCase().includes(query) ||
          faq.category.toLowerCase().includes(query)
        );
        this.renderFaqs(filtered);
      });
    }
  },

  renderFaqs(faqList) {
    const container = document.getElementById('faqAccordionContainer');
    if (!container) return;

    if (faqList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-search-minus" style="font-size: 2.5rem; color: var(--gold); margin-bottom: 1rem;"></i>
          <p>No FAQs match your search query. Try searching for other terms like 'Internet', 'Sheets', or 'Fingerprint'.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = faqList.map((faq, idx) => `
      <div class="faq-item">
        <div class="faq-header" onclick="this.parentElement.classList.toggle('active')">
          <span class="faq-title">${faq.question}</span>
          <i class="fas fa-plus faq-icon"></i>
        </div>
        <div class="faq-body">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');
  }
};

window.faqPage = FaqPage;
