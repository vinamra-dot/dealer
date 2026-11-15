# AGENTS.md — Professional Software Engineering & Ponytail Rules

## Core Philosophy: Professional Senior Engineering
- Build complete, production-ready, industry-grade software. Zero amateur shortcuts.
- Write the smallest complete change that solves the problem robustly.
- Zero dead code: no unused imports, dead variables, or uncalled handlers.

---

## 🚨 MANDATORY PROJECT RULES (Zero Exception)

### 1. File Length Constraint (< 200 Lines)
- **NO file may exceed 200 lines.** Every file must be concise, focused, and modular.
- If a file approaches 170 lines, immediately refactor into sub-modules or helpers.

### 2. UI Theme: Professional Light Theme Only (Strictly No Dark Theme)
- Clean whites (`#ffffff`), slate surfaces (`#f8fafc`), crisp borders (`#e2e8f0`), deep slate typography (`#0f172a`).
- Modern enterprise SaaS aesthetic (Linear / Stripe / Apple enterprise standard).
- No unneeded footer text or disclaimers.

### 3. Strict Role-Based Data Isolation (RBAC)
- **Every role MUST have strict data boundaries.** Never expose all tabs or confidential financial data to every user:
  - `TELECALLER`: Lead intake & follow-up only. No finance or holding costs.
  - `SALES_CONSULTANT`: Assigned leads, test drives, quotes, bookings only.
  - `FINANCE_HEAD`: Invoicing, payments, bank DO sanctions, dealer payouts only.
  - `LOGISTICS_PDI` & `DRIVER`: Stockyard gatepasses, odometer & transit logs only.
  - `GENERAL_MANAGER` & `CEO`: Full dealership analytics, GM approvals, OEM claims.

### 4. Dedicated Authentication Gate
- A dedicated, professional Login Screen must always gate unauthenticated access.
- Provide quick persona login selectors for testing all 8 distinct roles.

### 5. Rich, Realistic Enterprise Dataset
- The system must include realistic, voluminous data so every workflow stage (leads, demo cars, quotations, bookings, bank DOs, gate passes, claims) is populated and intuitive.
