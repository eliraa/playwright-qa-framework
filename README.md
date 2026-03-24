# Playwright Automation Framework (TypeScript)

A QA automation live demo project built with **Playwright + TypeScript**, focused on scalable test structure, real-world scenarios and combining UI testing with backend-aware validation.

---

## 🧠 Purpose

This project represents my transition from strong manual and backend QA into automation.

It is built to reflect real-world QA practices:
- focusing on high-risk scenarios
- structuring tests for maintainability
- thinking beyond UI validation
- combining exploratory mindset with automation

---

## ⚙️ Tech Stack

- Playwright  
- TypeScript  
- Node.js  

---

## 📁 Project Structure


page-objects/
src/
pages/
fixtures/
data/
config/
tests/


The structure separates:
- test logic  
- page objects  
- test data  
- environment configuration  

---

## 🧪 What is Covered

### UI Testing Playground
- async behavior  
- auto-waiting  
- dynamic elements  
- visibility  
- interaction patterns  

### OrangeHRM flows
- login  
- dashboard  
- admin users  
- filters & tables  

---

## 🔍 QA Approach

This project reflects my approach to QA:

- risk-based testing  
- backend awareness  
- investigation mindset  
- focus on system behavior, not only UI  
- maintainable and scalable structure  
---

## ⚠️ Improvements (in progress)

- reducing duplicated logic  
- improving locator strategy  
- better fixtures and hooks  
- separating navigation from elements  
- adding backend/API validations  

---

## 🚀 Run Tests

npm install
npx playwright install

Stable main suite:
`npm test`

Full repo suite, including live OrangeHRM coverage:
`npm run test:all`

OrangeHRM live demo suite:
`npm run test:orangehrm`

The main CI workflow uses the stable playground suite. OrangeHRM stays in the repo as
separate live-demo coverage because the external demo environment is not reliable enough
to be the primary blocking CI signal.

---

## 👩‍💻 About

Senior QA Engineer with 10+ years of experience in:

- backend validation  
- API testing  
- complex systems  
- production issue investigation  

Currently expanding into automation with Playwright.

---

## 🔗 Links
- LinkedIn: https://www.linkedin.com/in/elena-y-52a4a0121/  
- Portfolio: https://www.notion.so/LinkedIn-Senior-QA-Lead-Portfolio-308830cc4ad98040a2f9c4c9ccdcb880  
