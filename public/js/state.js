// Central Frontend Application State
export const state = {
  token: localStorage.getItem('df_token') || '',
  user: JSON.parse(localStorage.getItem('df_user') || 'null'),
  currentTab: 'dashboard',
  cache: {
    dashboard: null,
    leads: [],
    testDrives: [],
    quotes: [],
    bookings: [],
    finance: [],
    gatepasses: [],
    claims: []
  },
  roles: [
    { label: 'CEO / Admin', email: 'ceo@apexmotors.com', role: 'SYSTEM_ADMIN' },
    { label: 'General Manager', email: 'gm@apexmotors.com', role: 'GENERAL_MANAGER' },
    { label: 'Sales Manager', email: 'sales.mgr@apexmotors.com', role: 'SALES_MANAGER' },
    { label: 'Sales Consultant', email: 'sales.rep@apexmotors.com', role: 'SALES_CONSULTANT' },
    { label: 'Telecaller', email: 'telecaller@apexmotors.com', role: 'TELECALLER' },
    { label: 'Finance Head', email: 'finance@apexmotors.com', role: 'FINANCE_HEAD' },
    { label: 'PDI & Yard Lead', email: 'pdi@apexmotors.com', role: 'LOGISTICS_PDI' },
    { label: 'Transit Driver', email: 'driver@apexmotors.com', role: 'DRIVER' }
  ]
};

export function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('df_token', token);
  localStorage.setItem('df_user', JSON.stringify(user));
}

export function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('df_token');
  localStorage.removeItem('df_user');
}
