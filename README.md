# Bond Yield Calculator - Take-Home Assignment

A production-ready full-stack bond yield calculator built with React (TypeScript) and NestJS (TypeScript). Created as a technical assessment demonstrating clean architecture, comprehensive testing, and interview-ready code quality.

> **Built with AI-Assisted Development**: This project was developed using Claude Code (Anthropic's agentic coding assistant) following a structured, iterative prompting approach.

## Project Structure

```
interview-task/
├── backend/                              # NestJS Backend
│   ├── src/
│   │   ├── bond/
│   │   │   ├── dto/
│   │   │   │   ├── calculate-bond.dto.ts           # Request DTO with validation
│   │   │   │   └── bond-result.dto.ts              # Response DTO
│   │   │   ├── bond.controller.ts                  # REST controller
│   │   │   ├── bond.service.ts                     # Business logic
│   │   │   ├── bond.module.ts                      # Module definition
│   │   │   ├── ytm-calculator.ts                   # YTM bisection method (isolated)
│   │   │   └── ytm-calculator-newton-raphson.example.ts  # Alternative algorithm example
│   │   ├── app.module.ts                           # Root module
│   │   └── main.ts                                 # Application entry point
│   ├── BOND_CALCULATIONS.md                        # Mathematical formulas explained
│   ├── YTM_CALCULATOR_GUIDE.md                     # YTM calculator usage guide
│   ├── TEST_EXAMPLES.md                            # Test cases and examples
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
└── frontend/                             # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   └── BondCalculator.tsx                  # Main calculator component
    │   ├── services/
    │   │   └── bondApi.ts                          # API client
    │   ├── types/
    │   │   └── bond.types.ts                       # TypeScript interfaces
    │   ├── App.tsx                                 # Root component
    │   ├── main.tsx                                # Application entry point
    │   └── vite-env.d.ts                           # Vite type declarations
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

## Requirements Met

This implementation fulfills all requirements from the take-home assignment:

### Inputs
- Face value
- Annual coupon rate (%)
- Market price
- Years to maturity
- Coupon frequency (annual / semi-annual)

### Outputs
- Current yield
- Yield to Maturity (YTM) - solved using bisection method
- Total interest earned over life of bond
- Premium or discount indicator

### Cashflow Schedule
Complete table with:
- Period number
- Payment date (calculated from settlement date)
- Coupon payment
- Cumulative interest
- Remaining principal
- Principal payment (at maturity)
- Total payment per period

### Tech Stack
- **Frontend**: React with TypeScript
- **Backend**: NestJS with TypeScript
- **Strict typing** throughout entire codebase

## Features

### Backend (NestJS)
- **Clean Architecture**: Thin controllers, rich services, proper separation of concerns
- **No Magic Numbers**: All constants extracted to centralized configuration
- **Comprehensive Testing**: 22 unit tests covering happy paths, edge cases, and validation
- **Business Logic Validation**: Handles edge cases (zero-coupon bonds, extreme ratios)
- **DTO Validation**: Automatic validation using `class-validator` decorators
- **Health Endpoint**: `/health` for monitoring and API availability checks
- **Modular YTM Calculator**: Isolated algorithm that can be swapped (bisection ↔ Newton-Raphson)
- **Deterministic Date Calculations**: Separated date utilities for testability

### Frontend (React + Vite)
- **Custom Hooks**: Business logic separated into `useBondCalculation` hook
- **Reusable UI Components**: Card, Input, Select, Button, Alert, Loading
- **Comprehensive Validation**: Pure validation functions with clear error messages
- **Advanced Error Handling**: Custom error classes (ApiError, NetworkError, ValidationError)
- **Timeout Protection**: 10-second timeout with AbortController
- **Loading/Error/Empty States**: Complete UX coverage
- **Responsive Design**: Works seamlessly on all screen sizes
- **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation

## API Endpoint

### POST `/bond/calculate`

Calculate comprehensive bond metrics including current yield, yield to maturity (YTM), and cashflow schedule.

**Request Body:**
```json
{
  "faceValue": 1000,
  "annualCouponRate": 5,
  "marketPrice": 950,
  "yearsToMaturity": 10,
  "couponFrequency": "semi-annual"
}
```

**Validation Rules:**
- `faceValue`: Must be a positive number
- `annualCouponRate`: Must be between 0 and 100 (percentage)
- `marketPrice`: Must be a positive number
- `yearsToMaturity`: Must be a positive number
- `couponFrequency`: Must be either "annual" or "semi-annual"

**Response:**
```json
{
  "currentYield": 5.2632,
  "yieldToMaturity": 5.9128,
  "totalInterestEarned": 500.00,
  "premiumOrDiscount": "discount",
  "cashflowSchedule": [
    {
      "period": 1,
      "date": "2026-08-23",
      "couponPayment": 25.00,
      "principalPayment": 0,
      "totalPayment": 25.00
    },
    {
      "period": 2,
      "date": "2027-02-23",
      "couponPayment": 25.00,
      "principalPayment": 0,
      "totalPayment": 25.00
    },
    "... 18 more periods ...",
    {
      "period": 20,
      "date": "2036-02-23",
      "couponPayment": 25.00,
      "principalPayment": 1000.00,
      "totalPayment": 1025.00
    }
  ]
}
```

**Output Fields:**
- `currentYield`: Simple yield calculation (annual coupon / market price) in percentage
- `yieldToMaturity`: Internal rate of return if held to maturity, calculated using bisection method
- `totalInterestEarned`: Sum of all coupon payments over the bond's life
- `premiumOrDiscount`: "premium" (price > face), "discount" (price < face), or "par" (price ≈ face)
- `cashflowSchedule`: Array of all payment periods with dates and amounts

## Bond Calculation Details

The service implements sophisticated financial calculations:

1. **Current Yield**: Annual coupon payment divided by current market price
2. **Yield to Maturity (YTM)**: Solved numerically using the bisection method
3. **Cashflow Schedule**: Complete payment schedule over the bond's life
4. **Premium/Discount Analysis**: Determines bond trading status relative to par

For detailed mathematical explanations, see `backend/BOND_CALCULATIONS.md`.

## Testing

Comprehensive unit tests for `BondService` ensure correctness of core business logic:

```bash
cd backend
npm test
```

### Test Coverage (22 Tests)

**Happy Path Scenarios:**
- Discount bonds (market price < face value)
- Premium bonds (market price > face value)
- Par bonds (market price ≈ face value)
- Annual coupon frequency
- Semi-annual coupon frequency

**Edge Cases:**
- Zero-coupon bonds (0% coupon rate)
- Very short maturity (< 1 year)
- Very long maturity (30 years)
- Bonds priced very close to par
- Custom settlement dates

**Cashflow Schedule Validation:**
- Correct structure and field values
- Principal payment only at maturity
- Cumulative interest accumulation

**Validation & Error Handling:**
- Negative values rejected
- Zero face value rejected
- Invalid percentage ranges rejected
- Boundary conditions handled

**Precision Checks:**
- Yields rounded to 4 decimal places
- Currency rounded to 2 decimal places

### Test Results
```
Test Suites: 1 passed
Tests:       22 passed
Time:        ~2s
```

## Interview-Ready Features

### Easy to Modify Live
The codebase is structured for quick modifications during interviews:

**Examples of changes that can be made quickly:**
- Add new validation rules (constants extracted)
- Change YTM algorithm (modular design)
- Add new output metrics (e.g., duration, convexity)
- Modify precision rules (centralized in constants)
- Add new coupon frequencies (quarterly, monthly)
- Change calculation logic (clear separation)

### Code Quality Highlights
- **No Magic Numbers**: All values extracted to `constants.ts`
- **Pure Functions**: Easy to test, predictable behavior
- **Clear Documentation**: Inline comments explaining financial logic
- **SOLID Principles**: Single responsibility, dependency injection
- **DRY Principle**: No code duplication
- **Type Safety**: No `any` types, strict TypeScript

### Architecture Decisions
1. **Thin Controllers**: Only HTTP concerns (request/response)
2. **Rich Services**: Business logic, calculations, validations
3. **Extracted Constants**: Easy to modify during interviews
4. **Modular YTM Calculator**: Can swap algorithms without touching service
5. **Separated Date Logic**: Deterministic, testable
6. **Custom Hooks (Frontend)**: Business logic separated from UI
7. **Pure Validation Functions**: No side effects, easy to test

## AI-Assisted Development

This project was built using **Claude Code** (Anthropic's agentic coding assistant) demonstrating effective AI-assisted development practices.

### Prompting Strategy

**Phase 1: Initial Setup**
- Provided clear requirements for full-stack structure
- Specified tech stack (React + TypeScript, NestJS + TypeScript)
- Requested strict typing, clean folder structure, DTO validation

**Phase 2: Core Calculations**
- Requested YTM calculation using bisection method
- Asked for modular, isolated implementation
- Specified need for comprehensive inline comments explaining financial logic
- Emphasized avoiding magic numbers for interview-readiness

**Phase 3: Cashflow Schedule**
- Requested full cashflow schedule with payment dates
- Asked for deterministic date calculations (separated utility)
- Specified all required fields (period, date, payments, cumulative interest, principal)

**Phase 4: React UI**
- Requested component-based architecture with reusable UI components
- Asked for separation of business logic (custom hooks)
- Specified validation requirements (pure functions)
- Requested loading/error/empty states

**Phase 5: Interview-Proofing** (Final Refactoring)
- Requested constant extraction
- Asked for improved naming throughout
- Specified need for thin controllers (no business logic)
- Requested comprehensive unit tests
- Asked for enhanced error handling

### Key Decisions Made with AI

1. **Bisection Method for YTM**: Reliable convergence, easy to explain during interviews
2. **Separated Date Utils**: Deterministic calculations, easy to test
3. **Custom Hooks**: Separation of UI and business logic in React
4. **Extracted Constants**: All magic numbers centralized for quick modifications
5. **Comprehensive Tests**: Demonstrates understanding of edge cases and validation
6. **Custom Error Classes**: Better error handling with NetworkError, ValidationError, ApiError

### Tools & Workflow

- **Claude Code**: Primary development assistant
- **Iterative Enhancement**: Built features incrementally, tested at each step
- **TypeScript Compiler**: Strict type checking throughout
- **Jest**: Unit testing framework
- **Vite**: Fast frontend development

### Benefits of AI-Assisted Approach

Rapid prototyping with production-quality code
Comprehensive documentation and comments
Consistent code style throughout
Best practices implemented (SOLID, DRY, clean architecture)
Edge cases identified and handled
Testing strategy designed from the start

### YTM Calculator (Isolated Module)

The YTM calculation is implemented as an **isolated, modular component** that can be easily:
- Tested independently
- Swapped with different algorithms (Newton-Raphson, Secant method, etc.)
- Configured with custom tolerance and iteration limits
- Reused in other projects

**Key Features:**
- Configurable tolerance (default: 0.0001)
- Configurable max iterations (default: 100)
- Returns annualized YTM as percentage
- Prevents infinite loops
- Comprehensive mathematical comments
- Easy to swap algorithms

**Files:**
- `backend/src/bond/ytm-calculator.ts` - Main implementation (Bisection method)
- `backend/src/bond/ytm-calculator-newton-raphson.example.ts` - Alternative algorithm example
- `backend/YTM_CALCULATOR_GUIDE.md` - Complete usage guide

**Example Usage:**
```typescript
import { defaultYTMCalculator } from './ytm-calculator';

const result = defaultYTMCalculator(
  {
    marketPrice: 950,
    faceValue: 1000,
    couponPayment: 25,
    totalPeriods: 20,
    paymentsPerYear: 2,
  },
  {
    tolerance: 0.0001,
    maxIterations: 100,
  }
);

console.log(result.ytm);         // 5.9128%
console.log(result.iterations);  // 9
console.log(result.converged);   // true
```

**Swapping Algorithms:**

To switch to Newton-Raphson (or any other algorithm), simply change one line:

```typescript
// In ytm-calculator.ts
export const defaultYTMCalculator: YTMCalculator = calculateYTMNewtonRaphson;
```

No other code changes needed! See `YTM_CALCULATOR_GUIDE.md` for details.

## Testing the API

### Using cURL:

```bash
curl -X POST http://localhost:3000/bond/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "faceValue": 1000,
    "annualCouponRate": 5,
    "marketPrice": 950,
    "yearsToMaturity": 10,
    "couponFrequency": "semi-annual"
  }'
```

### Test Scenarios:

**Discount Bond** (Market Price < Face Value):
```json
{
  "faceValue": 1000,
  "annualCouponRate": 5,
  "marketPrice": 950,
  "yearsToMaturity": 10,
  "couponFrequency": "semi-annual"
}
```

**Premium Bond** (Market Price > Face Value):
```json
{
  "faceValue": 1000,
  "annualCouponRate": 8,
  "marketPrice": 1100,
  "yearsToMaturity": 10,
  "couponFrequency": "semi-annual"
}
```

**Par Bond** (Market Price ≈ Face Value):
```json
{
  "faceValue": 1000,
  "annualCouponRate": 5,
  "marketPrice": 1000,
  "yearsToMaturity": 10,
  "couponFrequency": "annual"
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`


checklist
3. **This README** - Complete project overview

### Be Prepared to Discuss
- Your structured prompting approach (5 phases)
- Why bisection method for YTM (vs Newton-Raphson)
- How constants extraction makes live modifications easy
- Test coverage strategy (22 tests covering what scenarios)
- Architecture decisions (thin controllers, rich services, modular design)

### Live Modification Examples
During the interview, you can quickly:
- Add new coupon frequency (quarterly): Update constants, add to DTO validation
- Switch YTM algorithm: Change one line in ytm-calculator.ts
- Add new metrics (duration): Create new method in BondService, add to DTO
- Modify precision: Update DECIMAL_PRECISION constants
- Add new validation rules: Add to validateBusinessRules() method

## Running the Application

1. Start the backend server (Terminal 1):
```bash
cd backend
npm run start:dev
```

2. Start the frontend server (Terminal 2):
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Build for Production

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

The production build will be in the `frontend/dist` directory.

## TypeScript Configuration

Both projects use strict TypeScript configuration:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictBindCallApply: true`
- `noFallthroughCasesInSwitch: true`

## Dependencies

### Backend
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`: NestJS framework
- `class-validator`: DTO validation
- `class-transformer`: Object transformation
- `reflect-metadata`: Metadata reflection (required for decorators)
- `rxjs`: Reactive programming

### Frontend
- `react`, `react-dom`: React library
- `vite`: Build tool
- `@vitejs/plugin-react`: Vite React plugin