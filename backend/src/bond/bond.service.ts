import { Injectable, BadRequestException } from '@nestjs/common';
import { CalculateBondDto } from './dto/calculate-bond.dto';
import {
  BondResultDto,
  CashflowEntry,
  PremiumDiscountType,
} from './dto/bond-result.dto';
import {
  defaultYTMCalculator,
  YTMCalculator,
  YTMConfig,
} from './ytm-calculator';
import {
  calculatePaymentDates,
  getCurrentDate,
} from './date-utils';
import {
  YTM_CALCULATION,
  DECIMAL_PRECISION,
  BOND_THRESHOLDS,
  PAYMENT_FREQUENCY,
  ERROR_MESSAGES,
} from './constants';

@Injectable()
export class BondService {
  private readonly ytmConfig: YTMConfig = {
    tolerance: YTM_CALCULATION.DEFAULT_TOLERANCE,
    maxIterations: YTM_CALCULATION.MAX_ITERATIONS,
  };
  private readonly ytmCalculator: YTMCalculator = defaultYTMCalculator;

  calculateBondValue(dto: CalculateBondDto): BondResultDto {
    this.validateBusinessRules(dto);
    const bondParameters = this.extractBondParameters(dto);

    const currentYield = this.calculateCurrentYield(bondParameters);
    const yieldToMaturity = this.calculateYieldToMaturity(bondParameters);
    const totalInterestEarned = this.calculateTotalInterestEarned(bondParameters);
    const bondClassification = this.classifyBond(bondParameters);

    const cashflowSchedule = this.generateCashflowSchedule(bondParameters);

    return new BondResultDto(
      this.roundToDecimal(currentYield, DECIMAL_PRECISION.YIELD),
      this.roundToDecimal(yieldToMaturity, DECIMAL_PRECISION.YIELD),
      this.roundToDecimal(totalInterestEarned, DECIMAL_PRECISION.CURRENCY),
      bondClassification,
      cashflowSchedule,
    );
  }

  
  private validateBusinessRules(dto: CalculateBondDto): void {
    const { marketPrice, faceValue, yearsToMaturity, annualCouponRate } = dto;
    if (marketPrice <= 0) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_MARKET_PRICE);
    }
    if (faceValue <= 0) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FACE_VALUE);
    }
    if (yearsToMaturity <= 0) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_YEARS);
    }
    if (annualCouponRate < 0 || annualCouponRate > 100) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_COUPON_RATE);
    }
    const priceRatio = marketPrice / faceValue;
    if (priceRatio > 10 || priceRatio < 0.1) {
      console.warn(
        `Unusual price ratio: ${priceRatio.toFixed(2)}x (market: ${marketPrice}, face: ${faceValue})`,
      );
    }
  }

  private extractBondParameters(dto: CalculateBondDto) {
    const {
      faceValue,
      annualCouponRate,
      marketPrice,
      yearsToMaturity,
      couponFrequency,
      settlementDate,
    } = dto;
    const effectiveSettlementDate = settlementDate || getCurrentDate();
    const frequencyConfig =
      couponFrequency === 'annual'
        ? PAYMENT_FREQUENCY.ANNUAL
        : PAYMENT_FREQUENCY.SEMI_ANNUAL;

    const paymentsPerYear = frequencyConfig.PAYMENTS_PER_YEAR;
    const totalPeriods = this.calculateTotalPeriods(
      yearsToMaturity,
      paymentsPerYear,
    );

    const couponPaymentPerPeriod = this.calculateCouponPaymentPerPeriod(
      annualCouponRate,
      faceValue,
      paymentsPerYear,
    );

    return {
      faceValue,
      annualCouponRate,
      marketPrice,
      yearsToMaturity,
      couponFrequency,
      settlementDate: effectiveSettlementDate,
      paymentsPerYear,
      totalPeriods,
      couponPaymentPerPeriod,
    };
  }

  private calculateTotalPeriods(
    yearsToMaturity: number,
    paymentsPerYear: number,
  ): number {
    const totalPeriods = yearsToMaturity * paymentsPerYear;
    if (totalPeriods < 1) {
      throw new BadRequestException(
        'Years to maturity must result in at least one payment period',
      );
    }

    return totalPeriods;
  }

  private calculateCouponPaymentPerPeriod(
    annualCouponRate: number,
    faceValue: number,
    paymentsPerYear: number,
  ): number {
    const annualCouponAmount = (annualCouponRate / 100) * faceValue;
    return annualCouponAmount / paymentsPerYear;
  }


  private calculateCurrentYield(params: ReturnType<typeof this.extractBondParameters>): number {
    const { annualCouponRate, faceValue, marketPrice } = params;

    if (marketPrice === 0) {
      return 0;
    }

    const annualCouponPayment = (annualCouponRate / 100) * faceValue;
    const currentYield = (annualCouponPayment / marketPrice) * 100;

    return currentYield;
  }

  private calculateYieldToMaturity(
    params: ReturnType<typeof this.extractBondParameters>,
  ): number {
    const {
      marketPrice,
      faceValue,
      couponPaymentPerPeriod,
      totalPeriods,
      paymentsPerYear,
    } = params;

    const ytmResult = this.ytmCalculator(
      {
        marketPrice,
        faceValue,
        couponPayment: couponPaymentPerPeriod,
        totalPeriods,
        paymentsPerYear,
      },
      this.ytmConfig,
    );
    if (!ytmResult.converged) {
      console.warn(
        `YTM calculation did not fully converge. Iterations: ${ytmResult.iterations}, Error: ${ytmResult.finalError}`,
      );
    }

    return ytmResult.ytm;
  }

  private calculateTotalInterestEarned(
    params: ReturnType<typeof this.extractBondParameters>,
  ): number {
    const { couponPaymentPerPeriod, totalPeriods } = params;
    return couponPaymentPerPeriod * totalPeriods;
  }


  private classifyBond(
    params: ReturnType<typeof this.extractBondParameters>,
  ): PremiumDiscountType {
    const { marketPrice, faceValue } = params;
    if (faceValue === 0) {
      return 'par'; 
    }

    const priceRatio = marketPrice / faceValue;
    const deviationFromPar = Math.abs(priceRatio - 1);
    if (deviationFromPar < BOND_THRESHOLDS.PAR_TOLERANCE) {
      return 'par';
    }

    return priceRatio > 1 ? 'premium' : 'discount';
  }

  private generateCashflowSchedule(
    params: ReturnType<typeof this.extractBondParameters>,
  ): CashflowEntry[] {
    const {
      settlementDate,
      couponFrequency,
      couponPaymentPerPeriod,
      faceValue,
      totalPeriods,
    } = params;

    const cashflowSchedule: CashflowEntry[] = [];

   
    const paymentDates = calculatePaymentDates(
      settlementDate,
      couponFrequency,
      totalPeriods,
    );


    let accumulatedInterest = 0;
    for (let periodNumber = 1; periodNumber <= totalPeriods; periodNumber++) {
      const isMaturityPeriod = periodNumber === totalPeriods;
      const principalPayment = isMaturityPeriod ? faceValue : 0;


      const totalPayment = couponPaymentPerPeriod + principalPayment;


      accumulatedInterest += couponPaymentPerPeriod;
      const outstandingPrincipal = isMaturityPeriod ? 0 : faceValue;

      cashflowSchedule.push({
        period: periodNumber,
        date: paymentDates[periodNumber - 1],
        couponPayment: this.roundToDecimal(
          couponPaymentPerPeriod,
          DECIMAL_PRECISION.CURRENCY,
        ),
        principalPayment: this.roundToDecimal(
          principalPayment,
          DECIMAL_PRECISION.CURRENCY,
        ),
        totalPayment: this.roundToDecimal(
          totalPayment,
          DECIMAL_PRECISION.CURRENCY,
        ),
        cumulativeInterest: this.roundToDecimal(
          accumulatedInterest,
          DECIMAL_PRECISION.CURRENCY,
        ),
        remainingPrincipal: this.roundToDecimal(
          outstandingPrincipal,
          DECIMAL_PRECISION.CURRENCY,
        ),
      });
    }

    return cashflowSchedule;
  }

  
  private roundToDecimal(value: number, decimalPlaces: number): number {
 
    if (!isFinite(value)) {
      return 0;
    }

    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier) / multiplier;
  }
}
