# DealerFlow Enterprise — Automobile Operations SaaS

DealerFlow is an industry-grade, enterprise SaaS platform engineered for modern multi-brand automobile dealerships. It eliminates departmental silos across lead intake, showroom floor demo drives, on-road quotation calculations, stockyard aging interest, and manufacturer (OEM) subsidy recovery.

---

## ⚡ Core Operational Capabilities

- **Executive Dealership Cockpit:** Live tracking of daily stockyard inventory holding interest (₹/day), available fleet count, active buyer pipeline, and recoverable OEM subsidies.
- **Dedicated Authentication Gate & Strict RBAC:** Role-based data boundaries across 8 distinct personas (CEO, GM, Sales Manager, Sales Consultant, Telecaller, Finance Head, Logistics PDI, Transit Driver).
- **Instant On-Road Quotation Builder:** Accurate Tier-1/Tier-2 Indian automotive taxation with RTO road tax (~10%), zero-dep insurance (~3.5%), Fastag, VAS add-ons, and printable Dealership Letterheads.
- **Order Transfer Form (OTF) & Chassis Engine:** Automated VIN allocation, real-time chassis swapping (returning unassigned vehicles to the yard pool), and formal 28% GST + 15% Cess Tax Invoices.
- **Used Car Trade-In Desk:** 20-point digital vehicle valuation with automatic credit ledger posting directly into new car downpayment balances.
- **Finance DO & Payment Audit Desk:** Multi-bank loan sanction tracking with automatic 1.5% dealer payout calculation and multi-mode payment auditing (UPI, NEFT, Cheque, Card).
- **Stockyard Logistics & Aging Cockpit:** Inventory aging buckets (0-15 days, 15-30 days, >30 days high-interest alert) and digital transit gatepass issuance with odometer verification.
- **VIP Handover & CSI Protocol:** Zero-balance ledger verification, 4-point physical delivery checklist, and 10-point Customer Satisfaction Index (CSI) recording.
- **OEM Incentive Recovery (Claims):** Automated compilation of Retail Target, Exchange Bonus, and Corporate Scheme claims.
- **Sales Consultant Leaderboard:** Monthly vehicle delivery quotas and test drive conversion metrics.

---

## 🛠 Tech Stack & Architecture

- **Backend:** Node.js (v24 ESM), Express.js
- **Database:** PostgreSQL (with versioned SQL migrations and dual-mode runtime support)
- **Frontend:** Clean Enterprise Light Theme (Tailwind CSS, FontAwesome 6, Vanilla JS ES Modules)
- **Security:** Hashed passwords with bcrypt, JSON Web Tokens (JWT), Role-Based Access Control (RBAC)

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server (auto-runs migrations & enterprise seeds)
npm start
```

Access the application at `http://localhost:4000`.

### Pre-Configured Test Accounts (Password: `Password@123`)

| Role | Email | Domain Access |
|---|---|---|
| **CEO / Admin** | `ceo@apexmotors.com` | Full Dealership Analytics & Settings |
| **General Manager** | `gm@apexmotors.com` | Dealership Cockpit & GM Approvals |
| **Sales Manager** | `sales.mgr@apexmotors.com` | Sales Floor & Consultant Leaderboards |
| **Sales Consultant** | `sales.rep@apexmotors.com` | Assigned Leads, Quotes, Bookings & Exchange |
| **Telecaller** | `telecaller@apexmotors.com` | Lead Intake & Pipeline Follow-up |
| **Finance Head** | `finance@apexmotors.com` | Invoicing, Bank DOs, Payments & Claims |
| **PDI & Yard Lead** | `pdi@apexmotors.com` | Stockyard Transit & Gatepasses |
| **Transit Driver** | `driver@apexmotors.com` | Gatepasses & Odometer Logs |

---

## 🧪 Testing

```bash
npm test
```

All 5 automated test suites verify authentication, RBAC authorization, and full lead-to-claim lifecycle operations.
