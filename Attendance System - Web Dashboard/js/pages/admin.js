/**
 * Spark Drives and Automations (SparkDNA) - Administrator Portal
 * File: js/pages/admin.js
 */

const AdminPage = {
  currentTab: 'dashboard',
  sessionUser: null,
  charts: {},
  loginView: 'login', // 'login', 'signup', 'forgot'
  weeklyOffset: 0,    // 0 = current, 1 = previous week group
  monthlyOffset: 0,   // 0 = current, 1 = previous month group
  selectedCalendarEmpId: null, // For Option 2 (Employee Calendar UI)
  selectedCalendarMonth: new Date().getMonth(), // 0-11
  selectedCalendarYear: new Date().getFullYear(),
  settingsMonth: new Date().getMonth(), // For Calendar Setting Tab
  settingsYear: new Date().getFullYear(),
  pollingTimer: null,
  pollingIntervalMs: 10000, // 10 second auto-refresh interval for live sheet updates

  render() {
    // Check session
    const storedSession = sessionStorage.getItem('sparkdna_admin_session');
    if (storedSession) {
      this.sessionUser = JSON.parse(storedSession);
    }

    if (!this.sessionUser) {
      this.stopPolling();
      if (this.loginView === 'signup') {
        return this.renderSignup();
      } else if (this.loginView === 'forgot') {
        return this.renderForgotPassword();
      }
      return this.renderLogin();
    }

    return this.renderDashboard();
  },

  renderLogin() {
    return `
      <div class="auth-wrapper">
        <div class="card auth-card">
          <div class="auth-header">
            <img src="assets/images/logo.jpg" class="auth-logo" alt="SparkDNA Logo">
            <h2 style="font-family: var(--font-heading); margin-top: 0.5rem;">Admin Portal</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Log in to manage biometric records and settings</p>
          </div>
          <div id="adminLoginAlert"></div>
          <form id="adminLoginForm">
            <div class="form-group">
              <label for="adminUsername">Username</label>
              <input type="text" id="adminUsername" class="form-control" placeholder="e.g. admin" required autocomplete="username">
            </div>
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label for="adminPassword" style="margin-bottom: 0;">Password</label>
                <a href="javascript:void(0)" id="adminForgotLink" style="font-size: 0.8rem; color: var(--gold); text-decoration: underline;">Forgot Password?</a>
              </div>
              <div style="position: relative;">
                <input type="password" id="adminPassword" class="form-control" placeholder="••••••••" required style="padding-right: 2.75rem;" autocomplete="current-password">
                <span class="password-toggle-icon" data-target="adminPassword" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted);"><i class="fas fa-eye"></i></span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              Log In <i class="fas fa-sign-in-alt"></i>
            </button>
            <div style="text-align: center; margin-top: 1.5rem;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">New Admin? </span>
              <a href="javascript:void(0)" id="adminSignupLink" style="font-size: 0.85rem; color: var(--gold); font-weight: 700; text-decoration: underline;">Create Account</a>
            </div>
          </form>
          <div style="background: rgba(217, 182, 93, 0.05); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(217, 182, 93, 0.2); margin-top: 1.5rem; text-align:center;">
            <small style="color: var(--text-muted);">Demo credentials: <strong>admin</strong> / <strong>admin123</strong></small>
          </div>
        </div>
      </div>
    `;
  },

  renderSignup() {
    return `
      <div class="auth-wrapper">
        <div class="card auth-card">
          <div class="auth-header">
            <img src="assets/images/logo.jpg" class="auth-logo" alt="SparkDNA Logo">
            <h2 style="font-family: var(--font-heading); margin-top: 0.5rem;">Admin Sign Up</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Create a new administrator account</p>
          </div>
          <div id="adminSignupAlert"></div>
          <form id="adminSignupForm">
            <div class="form-group">
              <label for="newAdminUsername">Choose Username</label>
              <input type="text" id="newAdminUsername" class="form-control" placeholder="e.g. neha" required autocomplete="username">
            </div>
            <div class="form-group">
              <label for="newAdminPassword">Choose Password</label>
              <div style="position: relative;">
                <input type="password" id="newAdminPassword" class="form-control" placeholder="••••••••" required style="padding-right: 2.75rem;" autocomplete="new-password">
                <span class="password-toggle-icon" data-target="newAdminPassword" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted);"><i class="fas fa-eye"></i></span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-gold" style="width: 100%; margin-top: 1rem;">
              Register Admin <i class="fas fa-user-plus"></i>
            </button>
            <div style="text-align: center; margin-top: 1.5rem;">
              <a href="javascript:void(0)" id="backToLoginLink" style="font-size: 0.85rem; color: var(--gold); text-decoration: underline;">Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  renderForgotPassword() {
    return `
      <div class="auth-wrapper">
        <div class="card auth-card">
          <div class="auth-header">
            <img src="assets/images/logo.jpg" class="auth-logo" alt="SparkDNA Logo">
            <h2 style="font-family: var(--font-heading); margin-top: 0.5rem;">Reset Password</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Verify your administrator username to reset</p>
          </div>
          <div id="adminForgotAlert"></div>
          <form id="adminForgotForm">
            <div class="form-group">
              <label for="forgotAdminUsername">Admin Username</label>
              <input type="text" id="forgotAdminUsername" class="form-control" placeholder="e.g. admin" required>
            </div>
            <div class="form-group">
              <label for="newAdminResetPassword">New Password</label>
              <div style="position: relative;">
                <input type="password" id="newAdminResetPassword" class="form-control" placeholder="••••••••" required style="padding-right: 2.75rem;">
                <span class="password-toggle-icon" data-target="newAdminResetPassword" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted);"><i class="fas fa-eye"></i></span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              Reset Password <i class="fas fa-key"></i>
            </button>
            <div style="text-align: center; margin-top: 1.5rem;">
              <a href="javascript:void(0)" id="forgotBackToLoginLink" style="font-size: 0.85rem; color: var(--gold); text-decoration: underline;">Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  renderDashboard() {
    return `
      <div class="dashboard-grid">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
          <div class="sidebar-nav">
            <div style="padding: 0 1rem 1rem 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em;">SYSTEM ROSTER</span>
              <h4 style="color: var(--premium-gold); font-family: var(--font-heading); margin-top: 0.25rem;">SparkDNA Admin</h4>
            </div>
            
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              <i class="fas fa-chart-line"></i> Dashboard
            </a>
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'employees' ? 'active' : ''}" data-tab="employees">
              <i class="fas fa-users"></i> Employee Directory
            </a>
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
              <i class="fas fa-calendar-check"></i> Attendance Logs
            </a>
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'onduty' ? 'active' : ''}" data-tab="onduty">
              <i class="fas fa-clipboard-check"></i> On Duty Requests
            </a>
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'time_setting' ? 'active' : ''}" data-tab="time_setting">
              <i class="fas fa-clock" style="color: #FFFFFF !important;"></i> Time Setting
            </a>
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'calendar_setting' ? 'active' : ''}" data-tab="calendar_setting">
              <i class="fas fa-calendar-alt"></i> Calendar Setting
            </a>
            <a href="javascript:void(0)" class="sidebar-link ${this.currentTab === 'settings' ? 'active' : ''}" data-tab="settings">
              <i class="fas fa-sliders-h"></i> Google Sheet Sync
            </a>
          </div>

          <div class="sidebar-user">
            <div class="sidebar-user-info">
              <span class="sidebar-user-name">${this.sessionUser.username}</span>
              <span class="sidebar-user-role">System Admin</span>
            </div>
            <button class="logout-btn" id="adminLogoutBtn" title="Logout">
              <i class="fas fa-power-off"></i>
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="dash-content" id="adminTabContent">
          <!-- Dynamic Content loaded here -->
        </main>
      </div>

      <!-- Add/Edit Employee Modal -->
      <div class="modal-overlay" id="employeeModal">
        <div class="modal-card" style="max-width: 650px;">
          <button class="modal-close" id="closeEmployeeModalBtn">&times;</button>
          <h3 class="modal-title" id="employeeModalTitle">Add New Employee</h3>
          <form id="employeeForm">
            <div id="employeeFormAlert"></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="empId">Employee ID *</label>
                <input type="text" id="empId" class="form-control" placeholder="e.g. EMP107" required>
              </div>
              <div class="form-group">
                <label for="empFingerId">Fingerprint ID *</label>
                <input type="number" id="empFingerId" class="form-control" placeholder="e.g. 7" min="1" max="1000" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem;">
              <div class="form-group">
                <label for="empName">Full Name *</label>
                <input type="text" id="empName" class="form-control" placeholder="Full Name" required>
              </div>
              <div class="form-group">
                <label for="empDob">Date of Birth *</label>
                <input type="date" id="empDob" class="form-control" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="empJoining">Date of Joining *</label>
                <input type="date" id="empJoining" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="empAadhar">Aadhar Number *</label>
                <input type="text" id="empAadhar" class="form-control" placeholder="XXXX-XXXX-XXXX" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 0.7fr 0.7fr 0.6fr; gap: 1rem;">
              <div class="form-group">
                <label for="empGender">Gender *</label>
                <select id="empGender" class="form-control" style="background: #0B0F19;" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label for="empBlood">Blood Group *</label>
                <input type="text" id="empBlood" class="form-control" placeholder="e.g. O+" required>
              </div>
              <div class="form-group">
                <label for="empStatus">Status</label>
                <select id="empStatus" class="form-control" style="background: #0B0F19;">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="empEmail">Email Address *</label>
                <input type="email" id="empEmail" class="form-control" placeholder="name@company.com" required>
              </div>
              <div class="form-group">
                <label for="empPhone">Phone Number *</label>
                <input type="tel" id="empPhone" class="form-control" placeholder="10-digit number" required>
              </div>
            </div>

            <div class="form-group">
              <label for="empAddress">Address *</label>
              <textarea id="empAddress" class="form-control" rows="2" placeholder="Full residential address" required></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cancelEmployeeModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Employee</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Employee Calendar UI Modal -->
      <div class="modal-overlay" id="employeeCalendarModal">
        <div class="modal-card" style="max-width: 650px;">
          <button class="modal-close" id="closeEmployeeCalendarModalBtn">&times;</button>
          <h3 class="modal-title" style="color: var(--gold);">Employee Working Calendar</h3>
          <div style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h4 id="calModalEmpName" style="color:var(--text-main); font-size:1.1rem; margin-bottom:0.15rem;">-</h4>
              <span id="calModalEmpId" style="font-family:monospace; color:var(--text-muted); font-size:0.8rem;">-</span>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button class="btn btn-secondary" id="calModalPrevMonthBtn" style="padding:0.25rem 0.5rem;"><i class="fas fa-chevron-left"></i></button>
              <span id="calModalMonthLabel" style="font-weight:700; color:var(--gold); font-size:0.9rem; min-width:80px; text-align:center;">-</span>
              <button class="btn btn-secondary" id="calModalNextMonthBtn" style="padding:0.25rem 0.5rem;"><i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
          <div id="calModalAlert" style="min-height:22px; margin-bottom:0.5rem; font-size:0.75rem; text-align:center;"></div>
          <div style="background: rgba(255,255,255,0.03); padding:0.6rem; border-radius:8px; margin-bottom:1rem; font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-around; flex-wrap:wrap; gap:0.5rem; border:1px solid rgba(255,255,255,0.06);">
            <span><i class="fas fa-circle" style="color:#10B981;"></i> Normal</span>
            <span><i class="fas fa-circle" style="color:#22D3EE;"></i> Extra</span>
            <span><i class="fas fa-circle" style="color:#F59E0B;"></i> Compensation</span>
            <span><i class="fas fa-circle" style="color:#EF4444;"></i> Leave</span>
            <span><i class="fas fa-circle" style="color:#A855F7;"></i> Holiday</span>
          </div>
          <div class="calendar-grid" id="employeeCalendarGrid">
            <!-- Dynamic calendar grids -->
          </div>
          <div class="modal-footer" style="margin-top:1.5rem;">
            <button type="button" class="btn btn-primary" id="closeEmployeeCalendarBtn">Done & Close</button>
          </div>
        </div>
      </div>

      <!-- Employee Percentage Statistics Modal -->
      <div class="modal-overlay" id="employeePercentageModal">
        <div class="modal-card" style="max-width: 440px;">
          <button class="modal-close" id="closeEmployeePercentageModalBtn">&times;</button>
          <h3 class="modal-title" style="text-align: center; color: var(--gold); font-size: 1.35rem; margin-bottom: 0.5rem;">Attendance Percentages</h3>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h4 id="pctModalName" style="color: var(--text-main); font-size: 1.15rem; margin-bottom: 0.25rem;">-</h4>
            <span id="pctModalId" style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace; font-weight: 700;">-</span>
          </div>

          <div class="stat-box-container" style="flex-wrap:wrap; gap:0.5rem;">
            <div class="stat-box-item" style="min-width:70px;">
              <span class="stat-box-title">Today</span>
              <span id="pctTodayStatus" class="badge" style="font-size: 0.75rem;">-</span>
            </div>
            <div class="stat-box-item" style="min-width:70px;">
              <span class="stat-box-title">Weekly</span>
              <span id="pctWeeklyVal" class="stat-box-value" style="color: var(--gold);">--%</span>
            </div>
            <div class="stat-box-item" style="min-width:70px;">
              <span class="stat-box-title">Monthly</span>
              <span id="pctMonthlyVal" class="stat-box-value" style="color: #10B981;">--%</span>
            </div>
            <div class="stat-box-item" style="min-width:70px;">
              <span class="stat-box-title">Late In</span>
              <span id="pctLateInVal" class="stat-box-value" style="color: #FBBF24;">0 Days</span>
            </div>
            <div class="stat-box-item" style="min-width:70px;">
              <span class="stat-box-title">Late Out</span>
              <span id="pctLateOutVal" class="stat-box-value" style="color: #F97316;">0 Days</span>
            </div>
          </div>
          <div class="modal-footer" style="justify-content: center; margin-top: 1.75rem;">
            <button type="button" class="btn btn-secondary" id="closePctModalBtn" style="padding: 0.5rem 1.5rem; font-size: 0.85rem;">Close</button>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    this.hookPasswordToggles();

    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const alertDiv = document.getElementById('adminLoginAlert');

        try {
          const res = await window.sparkApi.authenticateAdmin(username, password);
          if (res.status === 'success') {
            sessionStorage.setItem('sparkdna_admin_session', JSON.stringify(res.user));
            window.location.reload();
          } else {
            alertDiv.innerHTML = `<div class="alert alert-danger">Access Denied: ${res.message}</div>`;
          }
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-danger">Error checking credentials: ${err.message || err}</div>`;
        }
      });

      document.getElementById('adminSignupLink').addEventListener('click', () => {
        this.loginView = 'signup';
        const container = document.getElementById('appContentContainer');
        container.innerHTML = this.render();
        this.init();
      });

      document.getElementById('adminForgotLink').addEventListener('click', () => {
        this.loginView = 'forgot';
        const container = document.getElementById('appContentContainer');
        container.innerHTML = this.render();
        this.init();
      });

      return;
    }

    const signupForm = document.getElementById('adminSignupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('newAdminUsername').value.trim();
        const password = document.getElementById('newAdminPassword').value;
        const alertDiv = document.getElementById('adminSignupAlert');

        try {
          const res = await window.sparkApi.registerAdmin(username, password);
          if (res.status === 'success') {
            alertDiv.innerHTML = `<div class="alert alert-success">${res.message} Redirecting to login...</div>`;
            setTimeout(() => {
              this.loginView = 'login';
              const container = document.getElementById('appContentContainer');
              container.innerHTML = this.render();
              this.init();
            }, 2000);
          } else {
            alertDiv.innerHTML = `<div class="alert alert-danger">Registration failed: ${res.message}</div>`;
          }
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message || err}</div>`;
        }
      });

      document.getElementById('backToLoginLink').addEventListener('click', () => {
        this.loginView = 'login';
        const container = document.getElementById('appContentContainer');
        container.innerHTML = this.render();
        this.init();
      });
      return;
    }

    const forgotForm = document.getElementById('adminForgotForm');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('forgotAdminUsername').value.trim();
        const newPassword = document.getElementById('newAdminResetPassword').value;
        const alertDiv = document.getElementById('adminForgotAlert');

        try {
          const res = await window.sparkApi.resetAdminPassword(username, newPassword);
          if (res.status === 'success') {
            alertDiv.innerHTML = `<div class="alert alert-success">${res.message} Redirecting to login...</div>`;
            setTimeout(() => {
              this.loginView = 'login';
              const container = document.getElementById('appContentContainer');
              container.innerHTML = this.render();
              this.init();
            }, 2000);
          } else {
            alertDiv.innerHTML = `<div class="alert alert-danger">Reset failed: ${res.message}</div>`;
          }
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message || err}</div>`;
        }
      });

      document.getElementById('forgotBackToLoginLink').addEventListener('click', () => {
        this.loginView = 'login';
        const container = document.getElementById('appContentContainer');
        container.innerHTML = this.render();
        this.init();
      });
      return;
    }

    if (this.sessionUser) {
      this.updateGlobalConnectionBanner();
      
      const sidebarLinks = document.querySelectorAll('.sidebar-link');
      sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetTab = link.getAttribute('data-tab');
          this.switchTab(targetTab);
        });
      });

      const logoutBtn = document.getElementById('adminLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          this.stopPolling();
          sessionStorage.removeItem('sparkdna_admin_session');
          window.location.reload();
        });
      }

      const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const tabParam = queryParams.get('tab');
      if (tabParam) {
        this.currentTab = tabParam;
      }

      await this.loadTab(this.currentTab);
      this.startPolling();
    }
  },

  startPolling() {
    this.stopPolling();
    if (window.sparkApi.isConnectedToSheets()) {
      this.pollingTimer = setInterval(async () => {
        try {
          await this.refreshActiveTabSilently();
        } catch (e) {
          console.warn('Background auto-polling sync notice:', e);
        }
      }, this.pollingIntervalMs);
    }
  },

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  },

  async refreshActiveTabSilently() {
    if (!this.sessionUser) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      if (activeEl.id !== 'employeeSearch') return;
    }

    switch (this.currentTab) {
      case 'dashboard':
        const [empsD, recordsD] = await Promise.all([
          window.sparkApi.getEmployees(true),
          window.sparkApi.getRecordStats(true)
        ]);
        this.updateDashboardStatsUI(empsD, recordsD);
        break;
      case 'employees':
        const [empsE, attsE, onDutyE, wcE] = await Promise.all([
          window.sparkApi.getEmployees(true),
          window.sparkApi.getAttendanceLogs(true),
          window.sparkApi.getOnDutyRequests(true),
          window.sparkApi.getWorkingCalendar(true)
        ]);
        const empsWithStatus = this.computeEmployeesWithStatus(empsE, attsE, onDutyE, wcE);
        const searchInput = document.getElementById('employeeSearch');
        const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const filtered = q ? empsWithStatus.filter(emp => 
          emp['Employee ID'].toLowerCase().includes(q) ||
          emp['Name'].toLowerCase().includes(q) ||
          emp['Email'].toLowerCase().includes(q)
        ) : empsWithStatus;
        this.renderEmployeeTableRows(filtered);
        break;
      case 'attendance':
        const [logsA] = await Promise.all([
          window.sparkApi.getAttendanceLogs(true)
        ]);
        this.renderAttendanceLogTable(logsA);
        break;
      case 'onduty':
        const [onDutyO, empsO] = await Promise.all([
          window.sparkApi.getOnDutyRequests(true),
          window.sparkApi.getEmployees(true)
        ]);
        this.renderOnDutyTableRows(onDutyO, empsO);
        break;
    }
  },

  hookPasswordToggles(root = document) {
    const toggles = root.querySelectorAll('.password-toggle-icon');
    toggles.forEach(toggle => {
      toggle.onclick = () => {
        const inputId = toggle.getAttribute('data-target');
        const input = document.getElementById(inputId);
        if (input) {
          const type = input.type === 'password' ? 'text' : 'password';
          input.type = type;
          toggle.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        }
      };
    });
  },

  updateGlobalConnectionBanner() {
    const banner = document.getElementById('appConnectionBanner');
    if (banner) {
      const isConnected = window.sparkApi.isConnectedToSheets();
      if (isConnected) {
        banner.className = 'connection-banner connected';
        banner.innerHTML = `
          <div class="connection-status">
            <span class="status-dot"></span>
            <span>LIVE SHEET INTEGRATION CONNECTED (Auto-Syncing 10s)</span>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span>SparkDNA Apps Script Web App</span>
            <button class="btn btn-secondary" id="forceSyncNavBtn" style="padding:3px 12px; font-size:0.75rem; color:var(--gold); border-color:var(--gold); font-weight:700; background:rgba(217,182,93,0.1);">
              <i class="fas fa-sync-alt"></i> Sync Now
            </button>
          </div>
        `;
        const syncBtn = document.getElementById('forceSyncNavBtn');
        if (syncBtn) {
          syncBtn.onclick = async () => {
            syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            window.sparkApi.clearCache();
            await this.refreshActiveTabSilently();
            syncBtn.innerHTML = '<i class="fas fa-check"></i> Synced!';
            setTimeout(() => {
              if (document.getElementById('forceSyncNavBtn')) {
                document.getElementById('forceSyncNavBtn').innerHTML = '<i class="fas fa-sync-alt"></i> Sync Now';
              }
            }, 1500);
          };
        }
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
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    this.loadTab(tabName);
  },

  async loadTab(tabName) {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
        <i class="fas fa-cog fa-spin" style="font-size: 2.5rem; color: var(--primary-red); margin-bottom: 1rem;"></i>
        <p style="color: var(--text-muted);">Fetching records from backend...</p>
      </div>
    `;

    try {
      switch (tabName) {
        case 'dashboard':
          await this.loadDashboardTab(container);
          break;
        case 'employees':
          await this.loadEmployeesTab(container);
          break;
        case 'attendance':
          await this.loadAttendanceTab(container);
          break;
        case 'onduty':
          await this.loadOnDutyTab(container);
          break;
        case 'time_setting':
          await this.loadTimeSettingTab(container);
          break;
        case 'calendar_setting':
          await this.loadCalendarSettingTab(container);
          break;
        case 'settings':
          this.loadSettingsTab(container);
          break;
      }
    } catch (err) {
      container.innerHTML = `
        <div class="alert alert-danger" style="margin: 2rem;">
          <h4><i class="fas fa-exclamation-triangle"></i> Error Loading Data</h4>
          <p>${err.message || err}</p>
          <button class="btn btn-secondary" onclick="window.adminPage.loadTab('${tabName}')" style="margin-top: 1rem;">Retry Sync</button>
        </div>
      `;
    }
  },

  /* ================================================================= */
  /* TAB 1: DASHBOARD ANALYTICS */
  /* ================================================================= */
  async loadDashboardTab(container) {
    const [emps, records] = await Promise.all([
      window.sparkApi.getEmployees(),
      window.sparkApi.getRecordStats()
    ]);
    
    const activeEmps = emps.filter(e => String(e['Status'] || e['status'] || 'Active').toLowerCase() === 'active');
    const totalEmployeesCount = activeEmps.length;

    const todayStr = window.sparkUtils.getLocalDateString();
    const todayRecord = records.find(r => window.sparkUtils.normalizeDateStr(r['Date']) === todayStr) || { 'Present': 0, 'OnDuty': 0, 'Absent': totalEmployeesCount };

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">Enterprise Analytics</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Real-time workforce monitoring and attendance statistics</p>
        </div>
        <button class="btn btn-secondary" id="refreshDashBtn"><i class="fas fa-sync-alt"></i> Refresh Data</button>
      </div>

      <!-- Stats Row -->
      <div class="stats-row" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div class="card stat-card" style="padding: 1.25rem 0.75rem; text-align: center;">
          <i class="fas fa-users stat-icon" style="color: var(--gold); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <div class="stat-val" id="dashTotalEmpsVal" style="font-size: 1.8rem; font-weight:800;">${totalEmployeesCount}</div>
          <div class="stat-lbl" style="font-size: 0.75rem; color:var(--text-muted);">Total Employees</div>
        </div>
        <div class="card stat-card" style="padding: 1.25rem 0.75rem; text-align: center;">
          <i class="fas fa-user-check stat-icon" style="color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <div class="stat-val" id="dashPresentVal" style="font-size: 1.8rem; font-weight:800; color: #10B981;">${todayRecord['Present'] || 0}</div>
          <div class="stat-lbl" style="font-size: 0.75rem; color:var(--text-muted);">Present Today</div>
        </div>
        <div class="card stat-card" style="padding: 1.25rem 0.75rem; text-align: center;">
          <i class="fas fa-briefcase stat-icon" style="color: #22D3EE; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <div class="stat-val" id="dashOnDutyVal" style="font-size: 1.8rem; font-weight:800; color: #22D3EE;">${todayRecord['OnDuty'] || 0}</div>
          <div class="stat-lbl" style="font-size: 0.75rem; color:var(--text-muted);">On Duty Today</div>
        </div>
        <div class="card stat-card" style="padding: 1.25rem 0.75rem; text-align: center;">
          <i class="fas fa-user-times stat-icon" style="color: #EF4444; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <div class="stat-val" id="dashAbsentVal" style="font-size: 1.8rem; font-weight:800; color: #EF4444;">${todayRecord['Absent'] !== undefined ? todayRecord['Absent'] : totalEmployeesCount}</div>
          <div class="stat-lbl" style="font-size: 0.75rem; color:var(--text-muted);">Absent Today</div>
        </div>
        <div class="card stat-card" style="padding: 1.25rem 0.75rem; text-align: center;">
          <i class="fas fa-clock stat-icon" style="color: #FBBF24; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <div class="stat-val" id="dashLateInVal" style="font-size: 1.8rem; font-weight:800; color: #FBBF24;">${todayRecord['LateIn'] || 0}</div>
          <div class="stat-lbl" style="font-size: 0.75rem; color:var(--text-muted);">Late In Today</div>
        </div>
        <div class="card stat-card" style="padding: 1.25rem 0.75rem; text-align: center;">
          <i class="fas fa-history stat-icon" style="color: #F97316; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <div class="stat-val" id="dashLateOutVal" style="font-size: 1.8rem; font-weight:800; color: #F97316;">${todayRecord['LateOut'] || 0}</div>
          <div class="stat-lbl" style="font-size: 0.75rem; color:var(--text-muted);">Late Out Today</div>
        </div>
      </div>

      <!-- Charts Vertical Columns with Offset Controls -->
      <div style="display: flex; flex-direction: column; gap: 2.5rem; margin-bottom: 2rem; max-width: 1000px; margin-left: auto; margin-right: auto;">
        
        <!-- Weekly Report Chart -->
        <div class="chart-card" style="background: rgba(17, 24, 39, 0.75); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: var(--premium-gold); font-size: 1.25rem;">
              <i class="fas fa-calendar-week" style="color:var(--gold); margin-right: 8px;"></i> Weekly Statistics
            </h4>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button class="btn btn-secondary" id="dashPrevWeekBtn" style="padding:0.25rem 0.75rem; font-size:0.8rem;"><i class="fas fa-chevron-left"></i> Previous Week</button>
              <button class="btn btn-secondary" id="dashNextWeekBtn" style="padding:0.25rem 0.75rem; font-size:0.8rem; ${this.weeklyOffset === 0 ? 'opacity:0.5; pointer-events:none;' : ''}">Next Week <i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
          <div>
            <canvas id="weeklyAttendanceChart"></canvas>
          </div>
        </div>

        <!-- Monthly Report Chart -->
        <div class="chart-card" style="background: rgba(17, 24, 39, 0.75); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: var(--premium-gold); font-size: 1.25rem;">
              <i class="fas fa-calendar-alt" style="color:#10B981; margin-right: 8px;"></i> Monthly Statistics
            </h4>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button class="btn btn-secondary" id="dashPrevMonthBtn" style="padding:0.25rem 0.75rem; font-size:0.8rem;"><i class="fas fa-chevron-left"></i> Previous Month</button>
              <button class="btn btn-secondary" id="dashNextMonthBtn" style="padding:0.25rem 0.75rem; font-size:0.8rem; ${this.monthlyOffset === 0 ? 'opacity:0.5; pointer-events:none;' : ''}">Next Month <i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
          <div>
            <canvas id="monthlyAttendanceChart"></canvas>
          </div>
        </div>

      </div>
    `;

    document.getElementById('refreshDashBtn').addEventListener('click', async () => {
      window.sparkApi.clearCache();
      if (window.sparkApi.isConnectedToSheets()) {
        await window.sparkApi.reloadAllFromSheets();
      }
      this.loadTab('dashboard');
    });

    document.getElementById('dashPrevWeekBtn').onclick = () => {
      this.weeklyOffset++;
      this.loadTab('dashboard');
    };
    document.getElementById('dashNextWeekBtn').onclick = () => {
      if (this.weeklyOffset > 0) {
        this.weeklyOffset--;
        this.loadTab('dashboard');
      }
    };
    document.getElementById('dashPrevMonthBtn').onclick = () => {
      this.monthlyOffset++;
      this.loadTab('dashboard');
    };
    document.getElementById('dashNextMonthBtn').onclick = () => {
      if (this.monthlyOffset > 0) {
        this.monthlyOffset--;
        this.loadTab('dashboard');
      }
    };

    setTimeout(() => {
      this.initDashboardCharts(records, totalEmployeesCount);
    }, 50);
  },

  updateDashboardStatsUI(emps, records) {
    const activeEmps = emps.filter(e => String(e['Status'] || e['status'] || 'Active').toLowerCase() === 'active');
    const totalEmployeesCount = activeEmps.length;
    const todayStr = window.sparkUtils.getLocalDateString();
    const todayRecord = records.find(r => window.sparkUtils.normalizeDateStr(r['Date']) === todayStr) || { 'Present': 0, 'OnDuty': 0, 'Absent': totalEmployeesCount };

    const totalEl = document.getElementById('dashTotalEmpsVal');
    const presEl = document.getElementById('dashPresentVal');
    const odEl = document.getElementById('dashOnDutyVal');
    const absEl = document.getElementById('dashAbsentVal');

    if (totalEl) totalEl.textContent = totalEmployeesCount;
    if (presEl) presEl.textContent = todayRecord['Present'] || 0;
    if (odEl) odEl.textContent = todayRecord['OnDuty'] || 0;
    if (absEl) absEl.textContent = todayRecord['Absent'] !== undefined ? todayRecord['Absent'] : totalEmployeesCount;
  },

  initDashboardCharts(records, totalEmps) {
    if (totalEmps <= 0) totalEmps = 1;

    const sortedRecords = [...records].sort((a, b) => new Date(window.sparkUtils.normalizeDateStr(a['Date'])) - new Date(window.sparkUtils.normalizeDateStr(b['Date'])));

    Chart.defaults.color = '#9CA3AF';
    Chart.defaults.font.family = 'Inter';

    const nonSundayRecords = sortedRecords.filter(r => new Date(window.sparkUtils.normalizeDateStr(r['Date'])).getDay() !== 0);
    const weekChunks = [];
    for (let i = nonSundayRecords.length; i > 0; i -= 6) {
      const chunk = nonSundayRecords.slice(Math.max(0, i - 6), i);
      if (chunk.length > 0) weekChunks.push(chunk);
    }
    weekChunks.reverse();

    const itemsPerPage = 4;
    const endIdx = weekChunks.length - (this.weeklyOffset * itemsPerPage);
    const startIdx = Math.max(0, endIdx - itemsPerPage);
    const visibleWeeks = weekChunks.slice(startIdx, endIdx);

    const weeklyLabels = visibleWeeks.map((chunk) => {
      const firstDate = window.sparkUtils.normalizeDateStr(chunk[0]['Date']);
      const lastDate = window.sparkUtils.normalizeDateStr(chunk[chunk.length - 1]['Date']);
      return `${firstDate.substring(5)} to ${lastDate.substring(5)}`;
    });

    const weeklyData = visibleWeeks.map(chunk => {
      let totalPunches = 0;
      let possiblePunches = chunk.length * totalEmps;
      chunk.forEach(r => {
        totalPunches += Number(r['Present'] || 0) + Number(r['OnDuty'] || 0);
      });
      return Math.round((totalPunches / possiblePunches) * 100);
    });

    if (this.charts.weekly) this.charts.weekly.destroy();
    const wCanvas = document.getElementById('weeklyAttendanceChart');
    if (wCanvas) {
      this.charts.weekly = new Chart(wCanvas, {
        type: 'bar',
        data: {
          labels: weeklyLabels.length > 0 ? weeklyLabels : ['No Data'],
          datasets: [{
            label: 'Average Attendance Rate (%)',
            data: weeklyData.length > 0 ? weeklyData : [0],
            backgroundColor: '#D9B65D',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, title: { display: true, text: 'Attendance (%)' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const monthlyGroups = {};
    sortedRecords.forEach(r => {
      const dStr = window.sparkUtils.normalizeDateStr(r['Date']);
      const monthKey = dStr.substring(0, 7);
      if (!monthlyGroups[monthKey]) monthlyGroups[monthKey] = [];
      monthlyGroups[monthKey].push(r);
    });

    const monthKeys = Object.keys(monthlyGroups).sort();
    const monthEndIdx = monthKeys.length - this.monthlyOffset;
    const monthStartIdx = Math.max(0, monthEndIdx - 6);
    const visibleMonths = monthKeys.slice(monthStartIdx, monthEndIdx);

    const monthlyLabels = visibleMonths.map(k => {
      const date = new Date(k + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    const monthlyData = visibleMonths.map(k => {
      const chunk = monthlyGroups[k];
      let totalPunches = 0;
      let workingDays = chunk.filter(r => new Date(window.sparkUtils.normalizeDateStr(r['Date'])).getDay() !== 0).length || 1;
      let possiblePunches = workingDays * totalEmps;
      chunk.forEach(r => {
        if (new Date(window.sparkUtils.normalizeDateStr(r['Date'])).getDay() !== 0) {
          totalPunches += Number(r['Present'] || 0) + Number(r['OnDuty'] || 0);
        }
      });
      return Math.round((totalPunches / possiblePunches) * 100);
    });

    if (this.charts.monthly) this.charts.monthly.destroy();
    const mCanvas = document.getElementById('monthlyAttendanceChart');
    if (mCanvas) {
      this.charts.monthly = new Chart(mCanvas, {
        type: 'line',
        data: {
          labels: monthlyLabels.length > 0 ? monthlyLabels : ['No Data'],
          datasets: [{
            label: 'Monthly Average (%)',
            data: monthlyData.length > 0 ? monthlyData : [0],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, title: { display: true, text: 'Attendance (%)' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  },

  /* ================================================================= */
  /* TAB 2: EMPLOYEE DIRECTORY */
  /* ================================================================= */
  computeEmployeesWithStatus(emps, atts, onDuty, workingCalendar) {
    const todayStr = window.sparkUtils.getLocalDateString();
    const todayWorkingSetting = workingCalendar.find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === todayStr) || { 'Is Working Day': 'Yes', 'Working Time': '09:00:00' };

    return emps.map(emp => {
      const empId = String(emp['Employee ID'] || '').trim();
      const todayLogs = atts.filter(l => String(l['Employee ID'] || '').trim() === empId && window.sparkUtils.normalizeDateStr(l['Date']) === todayStr);
      let calculatedStatus = 'Absent';

      if (todayLogs.length > 0) {
        const latestLog = todayLogs[todayLogs.length - 1];
        const mode = String(latestLog['Mode'] || '').trim();
        
        if (latestLog['Punch Out Time'] && mode.toLowerCase() === 'dayout') {
          calculatedStatus = 'dayclose';
        } else {
          if (mode.toLowerCase() === 'working') {
            const inTimeStr = window.sparkUtils.formatTimeStr(latestLog['Punch In Time']);
            const officialTimeStr = todayWorkingSetting['Working Time'] || '09:00:00';
            if (inTimeStr > officialTimeStr) {
              calculatedStatus = 'Late';
            } else {
              calculatedStatus = 'working';
            }
          } else if (mode.toLowerCase() === 'lunch') {
            calculatedStatus = 'Lunch';
          } else if (mode.toLowerCase() === 'permission') {
            calculatedStatus = 'permission';
          } else if (mode.toLowerCase().indexOf('onduty') !== -1) {
            calculatedStatus = 'onduty';
          } else {
            calculatedStatus = mode;
          }
        }
      } else {
        const hasApprovedOnDuty = onDuty.some(r => String(r['Employee ID'] || '').trim() === empId && window.sparkUtils.normalizeDateStr(r['Date']) === todayStr && r['Status'] === 'Approved');
        if (hasApprovedOnDuty) {
          calculatedStatus = 'onduty';
        } else {
          calculatedStatus = 'Absent';
        }
      }

      return Object.assign({ todayStatus: calculatedStatus }, emp);
    });
  },

  async loadEmployeesTab(container) {
    const [emps, atts, onDuty, workingCalendar] = await Promise.all([
      window.sparkApi.getEmployees(),
      window.sparkApi.getAttendanceLogs(),
      window.sparkApi.getOnDutyRequests(),
      window.sparkApi.getWorkingCalendar()
    ]);

    const empsWithStatus = this.computeEmployeesWithStatus(emps, atts, onDuty, workingCalendar);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">Employee Directory</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Manage biometric registrations, designations, and personal details</p>
        </div>
        <button class="btn btn-primary" id="addNewEmployeeBtn"><i class="fas fa-user-plus"></i> Add Employee</button>
      </div>

      <div class="card">
        <div class="table-controls" style="display:flex; justify-content:space-between; margin-bottom:1rem;">
          <div class="table-search-box" style="flex:1; max-width:400px; position:relative;">
            <i class="fas fa-search" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--text-muted);"></i>
            <input type="text" id="employeeSearch" class="form-control" placeholder="Search employees by ID, name, or email..." style="padding-left:2.5rem;">
          </div>
          <button class="btn btn-secondary" id="exportEmployeesCsvBtn"><i class="fas fa-file-csv"></i> Export CSV</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Finger ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Today Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="employeeTableBody">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.renderEmployeeTableRows(empsWithStatus);

    document.getElementById('employeeSearch').oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = empsWithStatus.filter(emp => 
        emp['Employee ID'].toLowerCase().includes(q) ||
        emp['Name'].toLowerCase().includes(q) ||
        emp['Email'].toLowerCase().includes(q)
      );
      this.renderEmployeeTableRows(filtered);
    };

    document.getElementById('addNewEmployeeBtn').onclick = () => {
      this.showEmployeeModal();
    };

    document.getElementById('exportEmployeesCsvBtn').onclick = () => {
      window.sparkUtils.exportToCSV('SparkDNA_Employee_Directory',
        ['Employee ID', 'Fingerprint ID', 'Name', 'Date of Birth', 'Date of Joining', 'Address', 'Aadhar Number', 'Gender', 'Blood Group', 'Email', 'Phone'],
        emps,
        ['Employee ID', 'Fingerprint ID', 'Name', 'Date of Birth', 'Date of Joining', 'Address', 'Aadhar Number', 'Gender', 'Blood Group', 'Email', 'Phone']
      );
    };
  },

  renderEmployeeTableRows(list) {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:var(--text-muted);">No employees found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(emp => `
      <tr>
        <td style="font-weight:700; font-family:monospace;">${emp['Employee ID']}</td>
        <td style="color:var(--gold); font-weight:700; text-align:center;">#${emp['Fingerprint ID']}</td>
        <td><strong>${emp['Name']}</strong></td>
        <td>${emp['Email']}</td>
        <td>${emp['Phone']}</td>
        <td><span class="badge ${this.getCustomStatusBadgeClass(emp.todayStatus)}">${emp.todayStatus}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary opt1-btn" data-id="${emp['Employee ID']}" style="padding:4px 8px; font-size:0.75rem;" title="View/Edit Details"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-secondary opt2-btn" data-id="${emp['Employee ID']}" style="padding:4px 8px; font-size:0.75rem;" title="Mark Calendar"><i class="fas fa-calendar-alt"></i> Calendar</button>
            <button class="btn btn-secondary opt3-btn" data-id="${emp['Employee ID']}" style="padding:4px 8px; font-size:0.75rem;" title="Attendance Stats"><i class="fas fa-chart-pie"></i> Stats</button>
            <button class="btn btn-primary opt4-btn" data-id="${emp['Employee ID']}" style="padding:4px 8px; font-size:0.75rem; background:var(--dark-red);" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.opt1-btn').forEach(btn => {
      btn.onclick = () => this.showEmployeeModal(btn.getAttribute('data-id'));
    });
    tbody.querySelectorAll('.opt2-btn').forEach(btn => {
      btn.onclick = () => this.showEmployeeCalendarModal(btn.getAttribute('data-id'));
    });
    tbody.querySelectorAll('.opt3-btn').forEach(btn => {
      btn.onclick = () => this.showEmployeePercentageModal(btn.getAttribute('data-id'));
    });
    tbody.querySelectorAll('.opt4-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete employee ${id}? This action cannot be undone.`)) {
          const res = await window.sparkApi.deleteEmployee(id);
          if (res.status === 'success') {
            window.sparkApi.clearCache();
            this.loadTab('employees');
          } else {
            alert('Failed to delete employee: ' + res.message);
          }
        }
      };
    });
  },

  getCustomStatusBadgeClass(status) {
    if (!status) return 'badge-rejected';
    const s = status.toString().toLowerCase();
    if (s === 'working' || s === 'present') return 'badge-present';
    if (s === 'dayclose' || s === 'dayout') return 'badge-active';
    if (s === 'late') return 'badge-late';
    if (s === 'lunch' || s === 'permission') return 'badge-pending';
    if (s === 'onduty' || s === 'on-duty') return 'badge-onduty';
    if (s === 'absent') return 'badge-rejected';
    return 'badge-pending';
  },

  async showEmployeeModal(empId = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    const title = document.getElementById('employeeModalTitle');
    const alertDiv = document.getElementById('employeeFormAlert');
    
    alertDiv.innerHTML = '';
    form.reset();

    if (empId) {
      title.textContent = `Edit Employee (${empId})`;
      const emps = await window.sparkApi.getEmployees();
      const emp = emps.find(e => e['Employee ID'] === empId);
      if (emp) {
        document.getElementById('empId').value = emp['Employee ID'];
        document.getElementById('empId').readOnly = true;
        document.getElementById('empFingerId').value = emp['Fingerprint ID'] || '';
        document.getElementById('empName').value = emp['Name'] || '';
        document.getElementById('empDob').value = emp['Date of Birth'] || '';
        document.getElementById('empJoining').value = emp['Date of Joining'] || '';
        document.getElementById('empAadhar').value = emp['Aadhar Number'] || '';
        document.getElementById('empGender').value = emp['Gender'] || 'Male';
        document.getElementById('empBlood').value = emp['Blood Group'] || '';
        document.getElementById('empStatus').value = emp['Status'] || emp['status'] || 'Active';
        document.getElementById('empEmail').value = emp['Email'] || '';
        document.getElementById('empPhone').value = emp['Phone'] || '';
        document.getElementById('empAddress').value = emp['Address'] || '';
      }
    } else {
      title.textContent = 'Add New Employee';
      document.getElementById('empId').readOnly = false;
      document.getElementById('empJoining').value = window.sparkUtils.getLocalDateString();
    }

    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    document.getElementById('closeEmployeeModalBtn').onclick = closeModal;
    document.getElementById('cancelEmployeeModalBtn').onclick = closeModal;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        'Employee ID': document.getElementById('empId').value.trim(),
        'Fingerprint ID': document.getElementById('empFingerId').value.trim(),
        'Name': document.getElementById('empName').value.trim(),
        'Date of Birth': document.getElementById('empDob').value,
        'Date of Joining': document.getElementById('empJoining').value,
        'Aadhar Number': document.getElementById('empAadhar').value.trim(),
        'Gender': document.getElementById('empGender').value,
        'Blood Group': document.getElementById('empBlood').value.trim(),
        'Status': document.getElementById('empStatus').value,
        'Email': document.getElementById('empEmail').value.trim(),
        'Phone': document.getElementById('empPhone').value.trim(),
        'Address': document.getElementById('empAddress').value.trim(),
        'Password': '123'
      };

      let res;
      if (empId) {
        res = await window.sparkApi.updateEmployee(payload);
      } else {
        res = await window.sparkApi.addEmployee(payload);
      }

      if (res.status === 'success') {
        window.sparkApi.clearCache();
        closeModal();
        this.loadTab('employees');
      } else {
        alertDiv.innerHTML = `<div class="alert alert-danger">${res.message}</div>`;
      }
    };
  },

  async showEmployeeCalendarModal(empId) {
    this.selectedCalendarEmpId = empId;
    const modal = document.getElementById('employeeCalendarModal');
    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    document.getElementById('closeEmployeeCalendarModalBtn').onclick = closeModal;
    document.getElementById('closeEmployeeCalendarBtn').onclick = closeModal;

    const emps = await window.sparkApi.getEmployees();
    const emp = emps.find(e => e['Employee ID'] === empId);

    document.getElementById('calModalEmpName').textContent = emp ? emp['Name'] : 'Employee';
    document.getElementById('calModalEmpId').textContent = empId;

    document.getElementById('calModalPrevMonthBtn').onclick = () => {
      this.selectedCalendarMonth--;
      if (this.selectedCalendarMonth < 0) {
        this.selectedCalendarMonth = 11;
        this.selectedCalendarYear--;
      }
      this.renderEmployeeCalendarGrid();
    };
    document.getElementById('calModalNextMonthBtn').onclick = () => {
      this.selectedCalendarMonth++;
      if (this.selectedCalendarMonth > 11) {
        this.selectedCalendarMonth = 0;
        this.selectedCalendarYear++;
      }
      this.renderEmployeeCalendarGrid();
    };

    await this.renderEmployeeCalendarGrid();
  },

  async renderEmployeeCalendarGrid() {
    const grid = document.getElementById('employeeCalendarGrid');
    const monthLabel = document.getElementById('calModalMonthLabel');
    const alertEl = document.getElementById('calModalAlert');
    if (!grid || !monthLabel) return;

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    monthLabel.textContent = `${monthNames[this.selectedCalendarMonth].substring(0, 3)} ${this.selectedCalendarYear}`;

    const calendars = await window.sparkApi.getEmployeeCalendars();
    let myCal = calendars.find(c => String(c['Employee ID']) === String(this.selectedCalendarEmpId));
    if (!myCal) {
      myCal = { 'Employee ID': this.selectedCalendarEmpId };
    }

    grid.innerHTML = '';
    const daysInMonth = this.selectedCalendarMonth === 1 ? 29 : new Date(this.selectedCalendarYear, this.selectedCalendarMonth + 1, 0).getDate();

    const getStatusStyle = (val) => {
      switch (val) {
        case 'Extra':
          return { bg: 'rgba(34,211,238,0.18)', border: '#22D3EE', color: '#22D3EE' };
        case 'Compensation':
          return { bg: 'rgba(245,158,11,0.18)', border: '#F59E0B', color: '#F59E0B' };
        case 'Leave':
          return { bg: 'rgba(239,68,68,0.18)', border: '#EF4444', color: '#F87171' };
        case 'Holiday':
          return { bg: 'rgba(168,85,247,0.18)', border: '#A855F7', color: '#C084FC' };
        default: // 'Normal'
          return { bg: 'rgba(16,185,129,0.18)', border: '#10B981', color: '#34D399' };
      }
    };

    const setAlert = (msg, isError = false) => {
      if (!alertEl) return;
      alertEl.innerHTML = `<span style="color: ${isError ? '#EF4444' : '#10B981'}; font-weight: 600;"><i class="fas fa-${isError ? 'exclamation-circle' : 'check-circle'}"></i> ${msg}</span>`;
      setTimeout(() => { if (alertEl.innerHTML.includes(msg)) alertEl.innerHTML = ''; }, 3000);
    };

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPad = String(d).padStart(2, '0');
      const mStr = months[this.selectedCalendarMonth];
      const colKey = `${mStr}${dayPad}`;
      
      let currentVal = myCal[colKey] || 'Normal';
      let style = getStatusStyle(currentVal);

      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.style.cssText = `background: ${style.bg}; border: 1px solid ${style.border}; color: ${style.color}; border-radius: 6px; padding: 0.45rem 0.25rem; display: flex; flex-direction: column; align-items: center; cursor: pointer; font-size: 0.75rem; transition: transform 0.15s ease, box-shadow 0.15s ease; user-select: none; position: relative;`;
      cell.title = `Click to change status (Day ${d}: ${currentVal})`;
      
      cell.innerHTML = `
        <span style="font-weight:800; pointer-events:none;">Day ${d}</span>
        <span class="status-label" style="font-size:0.65rem; font-weight:700; margin-top:3px; pointer-events:none;">${currentVal}</span>
      `;

      cell.onclick = async (e) => {
        e.preventDefault();
        const states = ['Normal', 'Extra', 'Compensation', 'Leave', 'Holiday'];
        const currentIdx = states.indexOf(currentVal);
        const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % states.length;
        const nextVal = states[nextIdx];
        
        // Optimistic UI update
        currentVal = nextVal;
        myCal[colKey] = nextVal;
        style = getStatusStyle(nextVal);
        cell.style.background = style.bg;
        cell.style.borderColor = style.border;
        cell.style.color = style.color;
        cell.querySelector('.status-label').textContent = nextVal;
        cell.title = `Click to change status (Day ${d}: ${nextVal})`;
        cell.style.transform = 'scale(1.08)';
        setTimeout(() => { cell.style.transform = 'scale(1)'; }, 150);

        setAlert(`Day ${d} updated to ${nextVal}`);

        try {
          await window.sparkApi.saveEmployeeCalendarRow(this.selectedCalendarEmpId, myCal);
        } catch (err) {
          console.error('Error saving calendar row:', err);
          setAlert('Failed to sync changes to database', true);
        }
      };

      grid.appendChild(cell);
    }
  },

  async showEmployeePercentageModal(empId) {
    const modal = document.getElementById('employeePercentageModal');
    const nameEl = document.getElementById('pctModalName');
    const idEl = document.getElementById('pctModalId');
    const todayEl = document.getElementById('pctTodayStatus');
    const weeklyEl = document.getElementById('pctWeeklyVal');
    const monthlyEl = document.getElementById('pctMonthlyVal');

    idEl.textContent = empId;
    nameEl.textContent = 'Calculating...';
    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    document.getElementById('closeEmployeePercentageModalBtn').onclick = closeModal;
    document.getElementById('closePctModalBtn').onclick = closeModal;

    try {
      const [emps, logs, calendars, workingCalendar] = await Promise.all([
        window.sparkApi.getEmployees(),
        window.sparkApi.getAttendanceLogs(),
        window.sparkApi.getEmployeeCalendars(),
        window.sparkApi.getWorkingCalendar()
      ]);

      const emp = emps.find(e => e['Employee ID'] === empId);
      nameEl.textContent = emp ? emp['Name'] : 'Employee';
      const myCal = calendars.find(c => c['Employee ID'] === empId) || {};

      const todayStr = window.sparkUtils.getLocalDateString();
      const todayRecord = logs.find(l => String(l['Employee ID']).trim() === empId && window.sparkUtils.normalizeDateStr(l['Date']) === todayStr);

      if (todayRecord) {
        todayEl.textContent = todayRecord['Mode'] === 'Working' ? 'Present' : todayRecord['Mode'];
        todayEl.className = `badge ${this.getCustomStatusBadgeClass(todayRecord['Mode'] === 'Working' ? 'working' : (todayRecord['Mode'] || '').toLowerCase())}`;
      } else {
        todayEl.textContent = 'Absent';
        todayEl.className = 'badge badge-rejected';
      }

      const computePercentage = (daysCount) => {
        let expected = 0;
        let attended = 0;

        for (let i = 0; i < daysCount; i++) {
          const tempDate = new Date();
          tempDate.setDate(tempDate.getDate() - i);
          const dStr = window.sparkUtils.getLocalDateString(tempDate);

          const globalWC = workingCalendar.find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === dStr);
          const isGlobalWorking = globalWC ? globalWC['Is Working Day'] === 'Yes' : tempDate.getDay() !== 0;

          const monthShort = tempDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
          const dayPad = String(tempDate.getDate()).padStart(2, '0');
          const colName = `${monthShort}${dayPad}`;
          const indStat = myCal[colName] || 'Normal';

          let isExpected = isGlobalWorking;
          if (indStat === 'Leave') isExpected = false;
          if (indStat === 'Extra' || indStat === 'Compensation') isExpected = true;

          if (isExpected) expected++;

          const dayPunches = logs.filter(l => String(l['Employee ID']).trim() === empId && window.sparkUtils.normalizeDateStr(l['Date']) === dStr);
          if (dayPunches.length > 0) {
            attended++;
          }
        }

        if (expected === 0) return 100;
        return Math.round((attended / expected) * 100);
      };

      weeklyEl.textContent = `${computePercentage(7)}%`;
      monthlyEl.textContent = `${computePercentage(30)}%`;

      // Calculate Late In Days and Late Out Days for this employee
      let empLateInCount = 0;
      let empLateOutCount = 0;
      const empLogs = logs.filter(l => String(l['Employee ID']).trim() === empId);

      empLogs.forEach(l => {
        const dStr = window.sparkUtils.normalizeDateStr(l['Date']);
        const wcRule = workingCalendar.find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === dStr);
        const inLimit = wcRule && wcRule['In Time'] ? wcRule['In Time'] : (wcRule && wcRule['Working Time'] ? wcRule['Working Time'] : '09:00:00');
        const outLimit = wcRule && wcRule['Out Time'] ? wcRule['Out Time'] : '18:00:00';

        const pIn = window.sparkUtils.formatTimeStr(l['Punch In Time']);
        const pOut = window.sparkUtils.formatTimeStr(l['Punch Out Time']);

        if (pIn && pIn !== '--' && inLimit && inLimit !== '--') {
          const pInStr = pIn.length === 5 ? pIn + ':00' : pIn;
          const inStr = inLimit.length === 5 ? inLimit + ':00' : inLimit;
          if (pInStr > inStr) empLateInCount++;
        }

        if ((l['Mode'] === 'DayOut' || (l['Mode'] || '').toLowerCase().includes('dayclose') || pOut) && pOut && pOut !== '--' && outLimit && outLimit !== '--') {
          const pOutStr = pOut.length === 5 ? pOut + ':00' : pOut;
          const outStr = outLimit.length === 5 ? outLimit + ':00' : outLimit;
          if (pOutStr > outStr) empLateOutCount++;
        }
      });

      const lateInEl = document.getElementById('pctLateInVal');
      const lateOutEl = document.getElementById('pctLateOutVal');
      if (lateInEl) lateInEl.textContent = `${empLateInCount} ${empLateInCount === 1 ? 'Day' : 'Days'}`;
      if (lateOutEl) lateOutEl.textContent = `${empLateOutCount} ${empLateOutCount === 1 ? 'Day' : 'Days'}`;

    } catch (e) {
      console.error(e);
      nameEl.textContent = 'Error Loading Stats';
    }
  },

  /* ================================================================= */
  /* TAB 3: ATTENDANCE LOG & BUILT-IN BIOMETRIC SIMULATOR */
  /* ================================================================= */
  async loadAttendanceTab(container) {
    const [logs, emps, workingCalendar] = await Promise.all([
      window.sparkApi.getAttendanceLogs(),
      window.sparkApi.getEmployees(),
      window.sparkApi.getWorkingCalendar()
    ]);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">Attendance Logs</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">View live logs and simulate physical fingerprint terminals</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; margin-bottom: 2rem;">
        
        <!-- Attendance Table -->
        <div class="card">
          <h3 style="font-family:var(--font-heading); margin-bottom:1rem;"><i class="fas fa-list-ul" style="color:var(--gold);"></i> Log Records</h3>
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="attendanceLogTableBody">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Built-in Hardware Biometric Simulator -->
        <div class="card" style="border-color: rgba(199,0,17,0.2);">
          <div style="margin-bottom: 1.5rem;">
            <div class="badge-tag" style="background: rgba(199, 0, 17, 0.1); border-color: rgba(199, 0, 17, 0.3); color: var(--premium-gold); margin-bottom: 0.5rem;">
              IoT Hardware Terminal Mockup
            </div>
            <h3 style="font-family: var(--font-heading);">Spark Bio-Gate Pro</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Mock physical turnstile logs on behalf of employees for debugging.</p>
          </div>

          <div style="margin-bottom:1rem;">
            <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:0.25rem;">Select Employee Roster</label>
            <select id="simulatorEmpSelect" class="form-control" style="background: #0B0F19; font-weight:700;">
              ${emps.map(e => `<option value="${e['Employee ID']}">${e['Name']} (${e['Employee ID']})</option>`).join('')}
            </select>
          </div>

          <div style="margin-bottom:1.5rem;">
            <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:0.25rem;">Select Punch Mode</label>
            <select id="simulatorModeSelect" class="form-control" style="background: #0B0F19; font-weight:700;">
              <option value="Working">Working</option>
              <option value="Lunch">Lunch</option>
              <option value="Permission">Permission</option>
              <option value="Onduty">On Duty</option>
              <option value="Dayclose">Day Close</option>
            </select>
          </div>

          <div class="punch-hardware-grid" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius:10px; border:1px solid var(--border-color);">
            <div class="lcd-display" id="simulatorLcd" style="background: #030712; padding: 1rem; border-radius: 6px; border: 2px solid var(--gold); font-family: monospace; color: var(--gold); height: 100px; display: flex; flex-direction: column; justify-content: center;">
              <div class="lcd-line" id="lcdLine1" style="font-size:0.9rem; font-weight:700;">Spark Bio-Gate Pro</div>
              <div class="lcd-line" id="lcdLine2" style="font-size:0.85rem; color:#FFF; opacity:0.8; margin-top:0.25rem;">Ready to scan...</div>
            </div>

            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
              <button class="biometric-sensor-btn" id="simulatorScanBtn" title="Place Fingerprint" style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, var(--primary-red), var(--dark-red)); border:2px solid var(--border-color); color:#FFF; font-size:2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(199,0,17,0.3); transition:var(--transition-smooth);">
                <i class="fas fa-fingerprint"></i>
              </button>
              <span style="font-size:0.65rem; color:var(--text-muted); margin-top:0.5rem; font-weight:700; text-transform:uppercase;">Scan Finger</span>
            </div>
          </div>
        </div>

      </div>
    `;

    this.renderAttendanceLogTable(logs, workingCalendar);
    this.hookBiometricSimulator(emps);
  },

  renderAttendanceLogTable(logs, workingCalendar = []) {
    const tbody = document.getElementById('attendanceLogTableBody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No attendance log records.</td></tr>`;
      return;
    }

    const sorted = [...logs].sort((a, b) => {
      const dA = window.sparkUtils.normalizeDateStr(a['Date']) + ' ' + (window.sparkUtils.formatTimeStr(a['Punch In Time']) || '00:00:00');
      const dB = window.sparkUtils.normalizeDateStr(b['Date']) + ' ' + (window.sparkUtils.formatTimeStr(b['Punch In Time']) || '00:00:00');
      return dB.localeCompare(dA);
    });

    tbody.innerHTML = sorted.map(log => {
      const dateStr = window.sparkUtils.normalizeDateStr(log['Date']);
      const punchInTime = window.sparkUtils.formatTimeStr(log['Punch In Time']);
      const punchOutTime = window.sparkUtils.formatTimeStr(log['Punch Out Time']);

      // Look up working time & out time for this date
      const wcRule = (workingCalendar || []).find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === dateStr);
      const shiftInTime = wcRule && wcRule['In Time'] ? wcRule['In Time'] : (wcRule && wcRule['Working Time'] ? wcRule['Working Time'] : '09:00:00');
      const shiftOutTime = wcRule && wcRule['Out Time'] ? wcRule['Out Time'] : '18:00:00';

      let isLateIn = false;
      let isLateOut = false;

      if (punchInTime && punchInTime !== '--' && shiftInTime && shiftInTime !== '--') {
        const pInStr = punchInTime.length === 5 ? punchInTime + ':00' : punchInTime;
        const shiftInStr = shiftInTime.length === 5 ? shiftInTime + ':00' : shiftInTime;
        if (pInStr > shiftInStr) {
          isLateIn = true;
        }
      }
      if ((log['Mode'] || '').toLowerCase().includes('late in')) {
        isLateIn = true;
      }

      if ((log['Mode'] === 'DayOut' || (log['Mode'] || '').toLowerCase().includes('dayclose') || punchOutTime) && punchOutTime && punchOutTime !== '--' && shiftOutTime && shiftOutTime !== '--') {
        const pOutStr = punchOutTime.length === 5 ? punchOutTime + ':00' : punchOutTime;
        const shiftOutStr = shiftOutTime.length === 5 ? shiftOutTime + ':00' : shiftOutTime;
        if (pOutStr > shiftOutStr) {
          isLateOut = true;
        }
      }

      let statusBadges = [];
      if (isLateIn) {
        statusBadges.push(`<span class="badge badge-late" style="color:#FBBF24; border:1px solid rgba(245,158,11,0.3); background:rgba(245,158,11,0.15); font-weight:700;"><i class="fas fa-sign-in-alt"></i> Late In</span>`);
      }
      if (isLateOut) {
        statusBadges.push(`<span class="badge badge-late" style="color:#F97316; border:1px solid rgba(249,115,22,0.3); background:rgba(249,115,22,0.15); font-weight:700; margin-left:4px;"><i class="fas fa-sign-out-alt"></i> Late Out</span>`);
      }
      if (statusBadges.length === 0) {
        statusBadges.push(`<span class="badge badge-present" style="opacity:0.8;">On Time</span>`);
      }

      return `
        <tr>
          <td style="font-family:monospace; font-size:0.75rem;">${log['Log ID'] || '--'}</td>
          <td style="font-weight:700; font-family:monospace;">${log['Employee ID']}</td>
          <td><strong>${log['Name']}</strong></td>
          <td>${window.sparkUtils.formatDate(log['Date'])}</td>
          <td style="color:#10B981; font-family:monospace;">${punchInTime || '--'}</td>
          <td style="color:#F59E0B; font-family:monospace;">${punchOutTime || '--'}</td>
          <td><span class="badge ${this.getCustomStatusBadgeClass(log['Mode'] === 'Working' ? 'working' : (log['Mode'] || '').toLowerCase())}">${log['Mode']}</span></td>
          <td>${statusBadges.join(' ')}</td>
        </tr>
      `;
    }).join('');
  },

  hookBiometricSimulator(emps) {
    const scanBtn = document.getElementById('simulatorScanBtn');
    const lcdLine1 = document.getElementById('lcdLine1');
    const lcdLine2 = document.getElementById('lcdLine2');

    if (!scanBtn) return;

    scanBtn.onclick = async () => {
      const empId = document.getElementById('simulatorEmpSelect').value;
      const mode = document.getElementById('simulatorModeSelect').value;

      if (!empId) {
        alert('Please register an employee first.');
        return;
      }

      const emp = emps.find(e => e['Employee ID'] === empId);

      scanBtn.style.transform = 'scale(0.9)';
      scanBtn.style.borderColor = '#10B981';
      lcdLine1.textContent = 'Scanning...';
      lcdLine2.textContent = `Matching #${empId}`;

      try {
        const timeNow = new Date().toTimeString().split(' ')[0];
        const res = await window.sparkApi.punchAttendanceLog({
          'Employee ID': empId,
          'Name': emp ? emp['Name'] : 'Employee',
          'Date': window.sparkUtils.getLocalDateString(),
          'Time': timeNow,
          'Punch In Time': timeNow,
          'Action': mode
        });

        window.sparkApi.clearCache();

        if (res.status === 'success') {
          lcdLine1.textContent = `PASS: ${emp ? emp['Name'] : empId}`;
          lcdLine2.textContent = `Mode: ${mode} (${timeNow})`;
          lcdLine1.style.color = '#10B981';
        } else {
          lcdLine1.textContent = 'ACCESS DENIED';
          lcdLine2.textContent = res.message || 'Error';
          lcdLine1.style.color = '#EF4444';
        }
      } catch (err) {
        lcdLine1.textContent = 'SYSTEM ERROR';
        lcdLine2.textContent = err.message || 'Error';
        lcdLine1.style.color = '#EF4444';
      }

      setTimeout(() => {
        scanBtn.style.transform = 'none';
        scanBtn.style.borderColor = 'var(--border-color)';
      }, 500);

      const freshLogs = await window.sparkApi.getAttendanceLogs(true);
      this.renderAttendanceLogTable(freshLogs);
    };
  },

  /* ================================================================= */
  /* TAB 4: ON DUTY REQUESTS */
  /* ================================================================= */
  async loadOnDutyTab(container) {
    const [onDuty, emps] = await Promise.all([
      window.sparkApi.getOnDutyRequests(),
      window.sparkApi.getEmployees()
    ]);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">On Duty Requests</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Review and approve field assignments logged by personnel or hardware terminals</p>
        </div>
        <button class="btn btn-primary" id="newOnDutyBtn"><i class="fas fa-plus-circle"></i> Log On Duty Request</button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="onDutyTableBody">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- New On Duty Request Modal -->
      <div class="modal-overlay" id="onDutyModal">
        <div class="modal-card" style="max-width: 500px;">
          <button class="modal-close" id="closeOnDutyModalBtn">&times;</button>
          <h3 class="modal-title">Submit On Duty Request</h3>
          <form id="onDutyForm">
            <div id="onDutyFormAlert"></div>
            <div class="form-group">
              <label for="odEmpId">Select Employee *</label>
              <select id="odEmpId" class="form-control" style="background: #0B0F19;" required>
                ${emps.map(e => `<option value="${e['Employee ID']}">${e['Name']} (${e['Employee ID']})</option>`).join('')}
              </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="odDate">Date *</label>
                <input type="date" id="odDate" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="odTime">Time *</label>
                <input type="time" id="odTime" class="form-control" value="09:00" required style="color:#FFFFFF !important; background:#0B0F19 !important; color-scheme: dark !important;">
              </div>
            </div>
            <div class="form-group">
              <label for="odReason">Reason / Location *</label>
              <textarea id="odReason" class="form-control" rows="3" placeholder="e.g. Client Site Visit at ABC Industries" required></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cancelOnDutyModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary">Submit Request</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.renderOnDutyTableRows(onDuty, emps);

    document.getElementById('newOnDutyBtn').onclick = () => {
      const modal = document.getElementById('onDutyModal');
      document.getElementById('odDate').value = window.sparkUtils.getLocalDateString();
      modal.classList.add('active');

      const closeModal = () => modal.classList.remove('active');
      document.getElementById('closeOnDutyModalBtn').onclick = closeModal;
      document.getElementById('cancelOnDutyModalBtn').onclick = closeModal;

      document.getElementById('onDutyForm').onsubmit = async (e) => {
        e.preventDefault();
        const empId = document.getElementById('odEmpId').value;
        const emp = emps.find(x => x['Employee ID'] === empId);

        const requestPayload = {
          'Employee ID': empId,
          'Name': emp ? emp['Name'] : 'Employee',
          'Date': document.getElementById('odDate').value,
          'Time': document.getElementById('odTime').value,
          'Reason': document.getElementById('odReason').value.trim(),
          'Status': 'Pending',
          'Approved By': ''
        };

        const res = await window.sparkApi.submitOnDutyRequest(requestPayload);
        if (res.status === 'success') {
          window.sparkApi.clearCache();
          closeModal();
          this.loadTab('onduty');
        } else {
          document.getElementById('onDutyFormAlert').innerHTML = `<div class="alert alert-danger">${res.message}</div>`;
        }
      };
    };
  },

  renderOnDutyTableRows(onDuty, emps) {
    const tbody = document.getElementById('onDutyTableBody');
    if (!tbody) return;

    if (onDuty.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:3rem; color:var(--text-muted);">No on duty requests found.</td></tr>`;
      return;
    }

    const sorted = [...onDuty].sort((a, b) => new Date(window.sparkUtils.normalizeDateStr(b['Date'])) - new Date(window.sparkUtils.normalizeDateStr(a['Date'])));

    tbody.innerHTML = sorted.map(req => `
      <tr>
        <td style="font-family:monospace; font-size:0.75rem;">${req['Request ID']}</td>
        <td style="font-weight:700; font-family:monospace;">${req['Employee ID']}</td>
        <td><strong>${req['Name']}</strong></td>
        <td>${window.sparkUtils.formatDate(req['Date'])}</td>
        <td style="font-family:monospace;">${window.sparkUtils.formatTimeStr(req['Time'])}</td>
        <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${req['Reason']}</td>
        <td><span class="badge ${this.getCustomStatusBadgeClass(req['Status'])}">${req['Status']}</span></td>
        <td>${req['Approved By'] || '--'}</td>
        <td>
          <div style="display:flex; gap:6px;">
            ${req['Status'] === 'Pending' ? `
              <button class="btn btn-secondary approve-od-btn" data-id="${req['Request ID']}" style="padding:4px 8px; font-size:0.75rem; color:#10B981; border-color:#10B981;" title="Approve"><i class="fas fa-check"></i></button>
              <button class="btn btn-secondary reject-od-btn" data-id="${req['Request ID']}" style="padding:4px 8px; font-size:0.75rem; color:#EF4444; border-color:#EF4444;" title="Reject"><i class="fas fa-times"></i></button>
            ` : ''}
            <button class="btn btn-primary delete-od-btn" data-id="${req['Request ID']}" style="padding:4px 8px; font-size:0.75rem; background:var(--dark-red);" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.approve-od-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const res = await window.sparkApi.updateOnDutyStatus(id, 'Approved', this.sessionUser.username);
        if (res.status === 'success') {
          window.sparkApi.clearCache();
          this.loadTab('onduty');
        } else {
          alert('Failed: ' + res.message);
        }
      };
    });

    tbody.querySelectorAll('.reject-od-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const res = await window.sparkApi.updateOnDutyStatus(id, 'Rejected', this.sessionUser.username);
        if (res.status === 'success') {
          window.sparkApi.clearCache();
          this.loadTab('onduty');
        } else {
          alert('Failed: ' + res.message);
        }
      };
    });

    tbody.querySelectorAll('.delete-od-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this on duty request?')) {
          const res = await window.sparkApi.deleteOnDutyRequest(id);
          if (res.status === 'success') {
            window.sparkApi.clearCache();
            this.loadTab('onduty');
          }
        }
      };
    });
  },

  /* ================================================================= */
  /* TAB 5: TIME SETTING */
  /* ================================================================= */
  async loadTimeSettingTab(container) {
    const workingCalendar = await window.sparkApi.getWorkingCalendar();
    const todayStr = window.sparkUtils.getLocalDateString();
    const todaySetting = workingCalendar.find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === todayStr) || { 'Is Working Day': 'Yes', 'In Time': '09:00:00', 'Out Time': '18:00:00' };

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">Time & Shift Settings</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Configure official working hours, shift start times (In Time), and shift end times (Out Time)</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="card">
          <h3 style="font-family: var(--font-heading); margin-bottom: 1.5rem;"><i class="fas fa-clock" style="color:#FFFFFF !important; margin-right:8px;"></i> Shift Timing Configuration</h3>
          <form id="timeSettingForm">
            <div id="timeSettingAlert"></div>

            <div class="form-group">
              <label for="timeSettingDate">Select Date</label>
              <input type="date" id="timeSettingDate" class="form-control" value="${todayStr}" required style="color:#FFFFFF !important; color-scheme: dark !important;">
            </div>

            <div class="form-group">
              <label for="timeSettingIsWorking">Is Working Day?</label>
              <select id="timeSettingIsWorking" class="form-control" style="background:#0B0F19; color:#FFFFFF !important; color-scheme: dark !important;">
                <option value="Yes" ${todaySetting['Is Working Day'] === 'Yes' ? 'selected' : ''}>Yes (Working Day)</option>
                <option value="No" ${todaySetting['Is Working Day'] === 'No' ? 'selected' : ''}>No (Holiday / Sunday)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="timeSettingInTime"><i class="fas fa-clock" style="color:#FFFFFF !important; margin-right:6px;"></i> Shift Start (In Time)</label>
                <input type="time" id="timeSettingInTime" class="form-control" value="${todaySetting['In Time'] || todaySetting['Working Time'] || '09:00:00'}" step="1" required style="color:#FFFFFF !important; background:#0B0F19 !important; color-scheme: dark !important;">
                <small style="color:var(--text-muted); display:block; margin-top:0.35rem;">Check-in after this is LATE IN.</small>
              </div>

              <div class="form-group">
                <label for="timeSettingOutTime"><i class="fas fa-clock" style="color:#FFFFFF !important; margin-right:6px;"></i> Shift End (Out Time)</label>
                <input type="time" id="timeSettingOutTime" class="form-control" value="${todaySetting['Out Time'] || '18:00:00'}" step="1" required style="color:#FFFFFF !important; background:#0B0F19 !important; color-scheme: dark !important;">
                <small style="color:var(--text-muted); display:block; margin-top:0.35rem;">Check-out after this time is LATE OUT.</small>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-gold" style="margin-top: 1rem;"><i class="fas fa-save"></i> Save Shift Settings</button>
          </form>
        </div>

        <div class="card">
          <h3 style="font-family: var(--font-heading); margin-bottom: 1rem;"><i class="fas fa-list" style="color:#10B981; margin-right:8px;"></i> Configured Date Rules</h3>
          <div class="table-responsive" style="max-height:350px; overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Working Day</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                </tr>
              </thead>
              <tbody id="timeSettingRulesTable">
                ${workingCalendar.map(wc => `
                  <tr>
                    <td style="font-weight:700; font-family:monospace;">${window.sparkUtils.normalizeDateStr(wc['Date'])}</td>
                    <td><span class="badge ${wc['Is Working Day'] === 'Yes' ? 'badge-present' : 'badge-rejected'}">${wc['Is Working Day']}</span></td>
                    <td style="font-family:monospace; color:#10B981;">${window.sparkUtils.formatTimeStr(wc['In Time'] || wc['Working Time'] || '09:00:00')}</td>
                    <td style="font-family:monospace; color:#F59E0B;">${window.sparkUtils.formatTimeStr(wc['Out Time'] || '18:00:00')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('timeSettingDate').onchange = (e) => {
      const selected = e.target.value;
      const match = workingCalendar.find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === selected);
      if (match) {
        document.getElementById('timeSettingIsWorking').value = match['Is Working Day'];
        document.getElementById('timeSettingInTime').value = match['In Time'] || match['Working Time'] || '09:00:00';
        document.getElementById('timeSettingOutTime').value = match['Out Time'] || '18:00:00';
      }
    };

    document.getElementById('timeSettingForm').onsubmit = async (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('timeSettingDate').value;
      const isWorking = document.getElementById('timeSettingIsWorking').value;
      const inTimeVal = document.getElementById('timeSettingInTime').value;
      const outTimeVal = document.getElementById('timeSettingOutTime').value;

      const payload = {
        'Date': dateVal,
        'Is Working Day': isWorking,
        'In Time': inTimeVal.length === 5 ? inTimeVal + ':00' : inTimeVal,
        'Out Time': outTimeVal.length === 5 ? outTimeVal + ':00' : outTimeVal,
        'Working Time': inTimeVal.length === 5 ? inTimeVal + ':00' : inTimeVal
      };

      const res = await window.sparkApi.saveWorkingCalendar(payload);
      const alertDiv = document.getElementById('timeSettingAlert');
      if (res.status === 'success') {
        alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> Shift timings for ${dateVal} updated successfully.</div>`;
        setTimeout(() => this.loadTab('time_setting'), 1200);
      } else {
        alertDiv.innerHTML = `<div class="alert alert-danger">${res.message || 'Failed to save shift timings.'}</div>`;
      }
    };
  },

  /* ================================================================= */
  /* TAB 6: CALENDAR SETTING */
  /* ================================================================= */
  async loadCalendarSettingTab(container) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">Working Calendar Grid</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Quickly toggle working days and holidays across the enterprise calendar</p>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <button class="btn btn-secondary" id="commonCalPrevMonthBtn" style="padding:0.35rem 0.75rem;"><i class="fas fa-chevron-left"></i> Previous</button>
          <span id="commonCalMonthLabel" style="font-weight:700; color:var(--gold); font-size:1.1rem; min-width:140px; text-align:center;">-</span>
          <button class="btn btn-secondary" id="commonCalNextMonthBtn" style="padding:0.35rem 0.75rem;">Next <i class="fas fa-chevron-right"></i></button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="commonBulkSundaysHolidayBtn" style="padding:0.35rem 0.75rem; font-size:0.8rem; color:#EF4444; border-color:#EF4444;"><i class="fas fa-calendar-times"></i> Set Sundays as Holiday</button>
          <button class="btn btn-secondary" id="commonBulkWeekdaysWorkingBtn" style="padding:0.35rem 0.75rem; font-size:0.8rem; color:#10B981; border-color:#10B981;"><i class="fas fa-briefcase"></i> Set Weekdays as Working</button>
        </div>

        <div style="background: rgba(255,255,255,0.02); padding:0.75rem; border-radius:8px; margin-bottom:1.5rem; font-size:0.85rem; color:var(--text-muted); display:flex; justify-content:center; gap:2rem;">
          <span><i class="fas fa-circle" style="color:#10B981;"></i> Green = Working Day</span>
          <span><i class="fas fa-circle" style="color:#EF4444;"></i> Red = Holiday / Non-Working</span>
        </div>
        
        <div class="calendar-grid" id="commonCalendarGrid" style="grid-template-columns: repeat(7, 1fr); gap: 0.75rem;">
          <!-- Grid days -->
        </div>
      </div>
    `;

    document.getElementById('commonCalPrevMonthBtn').onclick = () => {
      this.settingsMonth--;
      if (this.settingsMonth < 0) {
        this.settingsMonth = 11;
        this.settingsYear--;
      }
      this.renderCommonCalendarGrid();
    };

    document.getElementById('commonCalNextMonthBtn').onclick = () => {
      this.settingsMonth++;
      if (this.settingsMonth > 11) {
        this.settingsMonth = 0;
        this.settingsYear++;
      }
      this.renderCommonCalendarGrid();
    };

    const sundaysBtn = document.getElementById('commonBulkSundaysHolidayBtn');
    if (sundaysBtn) {
      sundaysBtn.onclick = async () => {
        const daysInMonth = new Date(this.settingsYear, this.settingsMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dateObj = new Date(this.settingsYear, this.settingsMonth, d);
          if (dateObj.getDay() === 0) {
            const dateStr = window.sparkUtils.getLocalDateString(dateObj);
            await window.sparkApi.saveWorkingCalendar({
              'Date': dateStr,
              'Is Working Day': 'No',
              'Working Time': '--'
            });
          }
        }
        window.sparkApi.clearCache();
        await this.renderCommonCalendarGrid();
      };
    }

    const weekdaysBtn = document.getElementById('commonBulkWeekdaysWorkingBtn');
    if (weekdaysBtn) {
      weekdaysBtn.onclick = async () => {
        const daysInMonth = new Date(this.settingsYear, this.settingsMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dateObj = new Date(this.settingsYear, this.settingsMonth, d);
          if (dateObj.getDay() !== 0) {
            const dateStr = window.sparkUtils.getLocalDateString(dateObj);
            await window.sparkApi.saveWorkingCalendar({
              'Date': dateStr,
              'Is Working Day': 'Yes',
              'Working Time': '09:00:00'
            });
          }
        }
        window.sparkApi.clearCache();
        await this.renderCommonCalendarGrid();
      };
    }

    await this.renderCommonCalendarGrid();
  },

  async renderCommonCalendarGrid() {
    const grid = document.getElementById('commonCalendarGrid');
    const monthLabel = document.getElementById('commonCalMonthLabel');
    if (!grid || !monthLabel) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = `${monthNames[this.settingsMonth]} ${this.settingsYear}`;

    const calendarData = await window.sparkApi.getWorkingCalendar();
    grid.innerHTML = '';

    const daysInMonth = new Date(this.settingsYear, this.settingsMonth + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(this.settingsYear, this.settingsMonth, d);
      const dateStr = window.sparkUtils.getLocalDateString(dateObj);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      
      const config = calendarData.find(wc => window.sparkUtils.normalizeDateStr(wc['Date']) === dateStr) || {
        'Is Working Day': dateObj.getDay() === 0 ? 'No' : 'Yes',
        'Working Time': '09:00:00'
      };

      const isWorking = config['Is Working Day'] === 'Yes';
      const bgStyle = isWorking ? 'background: rgba(16,185,129,0.12); border-color:#10B981; color:#10B981;' : 'background: rgba(239,68,68,0.12); border-color:#EF4444; color:#EF4444;';

      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.style.cssText = `${bgStyle} border:1px solid; border-radius:8px; padding:0.75rem; display:flex; flex-direction:column; align-items:center; cursor:pointer; min-height:80px; justify-content:center;`;
      cell.innerHTML = `
        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${dayName}</span>
        <span style="font-size:1.25rem; font-weight:800; margin:4px 0;">${d}</span>
        <span style="font-size:0.7rem; font-weight:700;">${isWorking ? 'Working Day' : 'Holiday'}</span>
      `;

      cell.onclick = async () => {
        const nextWorking = config['Is Working Day'] === 'Yes' ? 'No' : 'Yes';
        const nextTime = nextWorking === 'Yes' ? '09:00:00' : '--';

        const payload = {
          'Date': dateStr,
          'Is Working Day': nextWorking,
          'Working Time': nextTime
        };

        await window.sparkApi.saveWorkingCalendar(payload);
        window.sparkApi.clearCache();
        await this.renderCommonCalendarGrid();
      };

      grid.appendChild(cell);
    }
  },

  /* ================================================================= */
  /* TAB 7: SETTINGS & GOOGLE SHEETS CONNECTION */
  /* ================================================================= */
  loadSettingsTab(container) {
    const isConnected = window.sparkApi.isConnectedToSheets();
    const currentUrl = window.sparkApi.getScriptUrl() || '';

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-family: var(--font-heading);">Google Sheets Sync Settings</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Bind your enterprise website database directly to a Google Sheet</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem;">
        <!-- Configuration Card -->
        <div class="card">
          <h3 style="font-family: var(--font-heading); margin-bottom: 1.5rem;"><i class="fas fa-link" style="color:var(--gold); margin-right:8px;"></i> Connection Settings</h3>
          
          <div id="settingsAlertContainer"></div>

          <form id="settingsConnectionForm">
            <div class="form-group">
              <label for="appsScriptUrl">Google Apps Script Web App URL</label>
              <input type="url" id="appsScriptUrl" class="form-control" 
                     placeholder="https://script.google.com/macros/s/AKfycb.../exec" 
                     value="${currentUrl}" required>
              <small style="color:var(--text-muted); display:block; margin-top:0.5rem; line-height:1.4;">
                * Make sure your Apps Script Web App is deployed as "Execute as: Me" and "Who has access: Anyone".
              </small>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button type="submit" class="btn btn-primary btn-gold" id="saveSettingsBtn">Save Configuration <i class="fas fa-save"></i></button>
              ${isConnected ? `
                <button type="button" class="btn btn-primary" id="disconnectSettingsBtn" style="background: var(--dark-red);">Disconnect Sheet</button>
              ` : ''}
            </div>
          </form>
        </div>

        <!-- Help Info Card -->
        <div class="card" style="border-color: rgba(217,182,93,0.15);">
          <h4 style="color: var(--premium-gold); font-family: var(--font-heading); margin-bottom: 1rem;"><i class="fas fa-info-circle"></i> Quick Connection Guide</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 1rem; line-height:1.5;">
            SparkDNA utilizes a serverless database structure. By deploying our Google Apps Script code to your Google Sheet, you get a free database with live spreadsheets syncing.
          </p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 1.5rem;">
            Read the full setup guide in: <br>
            <a href="google-apps-script/README.md" target="_blank" style="color: var(--gold); text-decoration: underline;">google-apps-script/README.md</a>
          </p>
          
          ${isConnected ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
              <h4 style="color: #10B981; font-family: var(--font-heading); margin-bottom: 0.5rem;"><i class="fas fa-cloud-upload-alt"></i> Database Migrator</h4>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom: 1rem; line-height:1.4;">
                Sync your current local simulation database directly into your connected Google Sheet.
              </p>
              <div id="migrationAlert"></div>
              <button class="btn btn-secondary" id="runMigrationBtn" style="width: 100%; font-size:0.85rem;"><i class="fas fa-database"></i> Push Local Data to Sheet</button>
            </div>
          ` : `
            <div style="background: rgba(199, 0, 17, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(199, 0, 17, 0.2);">
              <span style="font-size: 0.75rem; color:#FF8A93; font-weight:700;">PRO TIP:</span>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">
                Try out the dashboard first! Add/edit employees and mark calendars in mock mode. All records will be saved to your browser session (LocalStorage).
              </p>
            </div>
          `}
        </div>
      </div>
    `;

    const form = document.getElementById('settingsConnectionForm');
    const alertContainer = document.getElementById('settingsAlertContainer');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('appsScriptUrl').value.trim();
      const saveBtn = document.getElementById('saveSettingsBtn');

      saveBtn.innerHTML = 'Testing Connection... <i class="fas fa-spinner fa-spin"></i>';
      saveBtn.disabled = true;

      const working = await window.sparkApi.testConnection(url);
      
      if (working) {
        window.sparkApi.setScriptUrl(url);
        await window.sparkApi.reloadAllFromSheets();
        this.updateGlobalConnectionBanner();
        alertContainer.innerHTML = `
          <div class="alert alert-success">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            <strong>Connected successfully!</strong> All records from Google Sheets have been auto-loaded into the website.
          </div>
        `;
        setTimeout(() => this.loadTab(this.currentTab), 1500);
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-times-circle" style="margin-right: 8px;"></i>
            <strong>Connection Failed!</strong> The URL did not respond with success. Double check your deployment and sharing permissions.
          </div>
        `;
        saveBtn.innerHTML = 'Save Configuration <i class="fas fa-save"></i>';
        saveBtn.disabled = false;
      }
    });

    const disconnectBtn = document.getElementById('disconnectSettingsBtn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        if (confirm('Disconnect from Google Sheets and revert back to Simulated Local Storage database?')) {
          window.sparkApi.setScriptUrl(null);
          this.updateGlobalConnectionBanner();
          alert('Disconnected from Sheets. Reverted to Simulated database.');
          this.loadTab('settings');
        }
      });
    }

    const migrationBtn = document.getElementById('runMigrationBtn');
    if (migrationBtn) {
      migrationBtn.addEventListener('click', async () => {
        const migAlert = document.getElementById('migrationAlert');
        migrationBtn.innerHTML = 'Migrating... <i class="fas fa-spinner fa-spin"></i>';
        migrationBtn.disabled = true;
        
        migAlert.innerHTML = `<span style="font-size:0.75rem; color:var(--gold);">Uploading tables to Sheets... (this might take a few moments)</span>`;
        
        try {
          const res = await window.sparkApi.pushLocalDataToSheets();
          if (res.status === 'success') {
            migAlert.innerHTML = `<div class="alert alert-success" style="font-size:0.8rem; padding:0.5rem; margin-top:0.5rem;">${res.message}</div>`;
          } else {
            migAlert.innerHTML = `<div class="alert alert-danger" style="font-size:0.8rem; padding:0.5rem; margin-top:0.5rem;">${res.message}</div>`;
          }
        } catch (e) {
          migAlert.innerHTML = `<div class="alert alert-danger" style="font-size:0.8rem; padding:0.5rem; margin-top:0.5rem;">Error: ${e}</div>`;
        }
        
        migrationBtn.innerHTML = '<i class="fas fa-database"></i> Push Local Data to Sheet';
        migrationBtn.disabled = false;
      });
    }
  }
};

window.adminPage = AdminPage;
