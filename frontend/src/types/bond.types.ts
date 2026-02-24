export interface BondCalculationRequest {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: 'annual' | 'semi-annual';
  settlementDate?: string;
}

export interface CashflowEntry {
  period: number;
  date: string;
  couponPayment: number;
  principalPayment: number;
  totalPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export type PremiumDiscountType = 'premium' | 'discount' | 'par';

export interface BondCalculationResult {
  currentYield: number;
  yieldToMaturity: number;
  totalInterestEarned: number;
  premiumOrDiscount: PremiumDiscountType;
  cashflowSchedule: CashflowEntry[];
}
