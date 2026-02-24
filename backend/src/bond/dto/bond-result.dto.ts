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

export class BondResultDto {
  currentYield: number;
  yieldToMaturity: number;
  totalInterestEarned: number;
  premiumOrDiscount: PremiumDiscountType;
  cashflowSchedule: CashflowEntry[];

  constructor(
    currentYield: number,
    yieldToMaturity: number,
    totalInterestEarned: number,
    premiumOrDiscount: PremiumDiscountType,
    cashflowSchedule: CashflowEntry[],
  ) {
    this.currentYield = currentYield;
    this.yieldToMaturity = yieldToMaturity;
    this.totalInterestEarned = totalInterestEarned;
    this.premiumOrDiscount = premiumOrDiscount;
    this.cashflowSchedule = cashflowSchedule;
  }
}
