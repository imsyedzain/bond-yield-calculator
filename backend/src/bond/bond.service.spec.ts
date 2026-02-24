/**
 * BondService Unit Tests
 *
 * Demonstrates testing best practices:
 * - Test structure (Arrange-Act-Assert)
 * - Edge case coverage
 * - Clear test names
 * - Testing business logic in isolation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BondService } from './bond.service';
import { CalculateBondDto } from './dto/calculate-bond.dto';

describe('BondService', () => {
  let service: BondService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BondService],
    }).compile();

    service = module.get<BondService>(BondService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBondValue', () => {
    describe('Happy Path', () => {
      it('should calculate correct values for a discount bond', () => {
        // Arrange: Create input for discount bond (market price < face value)
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 950,
          yearsToMaturity: 10,
          couponFrequency: 'semi-annual',
        };

        // Act: Calculate bond values
        const result = service.calculateBondValue(input);

        // Assert: Verify results
        expect(result).toBeDefined();
        expect(result.currentYield).toBeGreaterThan(5); // Should be > coupon rate for discount
        expect(result.yieldToMaturity).toBeGreaterThan(result.currentYield); // YTM > CY for discount
        expect(result.premiumOrDiscount).toBe('discount');
        expect(result.totalInterestEarned).toBe(500); // 5% * 1000 * 10 years
        expect(result.cashflowSchedule).toHaveLength(20); // 10 years * 2 payments
      });

      it('should calculate correct values for a premium bond', () => {
        // Arrange: Market price > face value
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 8,
          marketPrice: 1100,
          yearsToMaturity: 10,
          couponFrequency: 'semi-annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.currentYield).toBeLessThan(8); // Should be < coupon rate for premium
        expect(result.yieldToMaturity).toBeLessThan(result.currentYield); // YTM < CY for premium
        expect(result.premiumOrDiscount).toBe('premium');
      });

      it('should calculate correct values for a par bond', () => {
        // Arrange: Market price = face value
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 1000,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.premiumOrDiscount).toBe('par');
        expect(result.currentYield).toBeCloseTo(5, 2); // Should equal coupon rate
        expect(result.yieldToMaturity).toBeCloseTo(5, 1); // Should equal coupon rate
        expect(result.cashflowSchedule).toHaveLength(10); // 10 years * 1 payment
      });

      it('should handle annual coupon frequency correctly', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 6,
          marketPrice: 1000,
          yearsToMaturity: 5,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.cashflowSchedule).toHaveLength(5); // 5 years * 1 payment
        expect(result.cashflowSchedule[0].couponPayment).toBe(60); // Full annual coupon
        expect(result.totalInterestEarned).toBe(300); // 6% * 1000 * 5 years
      });

      it('should handle semi-annual coupon frequency correctly', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 6,
          marketPrice: 1000,
          yearsToMaturity: 5,
          couponFrequency: 'semi-annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.cashflowSchedule).toHaveLength(10); // 5 years * 2 payments
        expect(result.cashflowSchedule[0].couponPayment).toBe(30); // Half of annual coupon
        expect(result.totalInterestEarned).toBe(300); // Same total, split over more periods
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero-coupon bond (0% coupon rate)', () => {
        // Arrange: Zero-coupon bond
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 0,
          marketPrice: 600,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.currentYield).toBe(0); // No coupon payments
        expect(result.totalInterestEarned).toBe(0); // No interest, only capital gain
        expect(result.premiumOrDiscount).toBe('discount');
        expect(result.cashflowSchedule[0].couponPayment).toBe(0);
      });

      it('should handle very short maturity (< 1 year)', () => {
        // Arrange: 6 months to maturity with semi-annual payments
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 990,
          yearsToMaturity: 0.5,
          couponFrequency: 'semi-annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.cashflowSchedule).toHaveLength(1); // Only one payment
        expect(result.cashflowSchedule[0].principalPayment).toBe(1000);
      });

      it('should handle very long maturity (30 years)', () => {
        // Arrange: 30-year bond
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 4,
          marketPrice: 950,
          yearsToMaturity: 30,
          couponFrequency: 'semi-annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.cashflowSchedule).toHaveLength(60); // 30 years * 2
        expect(result.totalInterestEarned).toBe(1200); // 4% * 1000 * 30 years
      });

      it('should handle bond priced very close to par', () => {
        // Arrange: Price within par threshold
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 1000.05, // Within 0.01% of par
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.premiumOrDiscount).toBe('par'); // Should be classified as par
      });

      it('should handle settlement date if provided', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 1000,
          yearsToMaturity: 2,
          couponFrequency: 'annual',
          settlementDate: '2024-01-15',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.cashflowSchedule[0].date).toBe('2025-01-15'); // 1 year after settlement
        expect(result.cashflowSchedule[1].date).toBe('2026-01-15'); // 2 years after settlement
      });
    });

    describe('Cashflow Schedule', () => {
      it('should generate correct cashflow schedule structure', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 6,
          marketPrice: 1000,
          yearsToMaturity: 2,
          couponFrequency: 'semi-annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert: Check first period
        const firstPeriod = result.cashflowSchedule[0];
        expect(firstPeriod.period).toBe(1);
        expect(firstPeriod.couponPayment).toBe(30);
        expect(firstPeriod.principalPayment).toBe(0);
        expect(firstPeriod.totalPayment).toBe(30);
        expect(firstPeriod.cumulativeInterest).toBe(30);
        expect(firstPeriod.remainingPrincipal).toBe(1000);
      });

      it('should show principal payment only at maturity', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 1000,
          yearsToMaturity: 2,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert: First period - no principal
        expect(result.cashflowSchedule[0].principalPayment).toBe(0);
        expect(result.cashflowSchedule[0].remainingPrincipal).toBe(1000);

        // Last period - principal repaid
        const lastPeriod = result.cashflowSchedule[result.cashflowSchedule.length - 1];
        expect(lastPeriod.principalPayment).toBe(1000);
        expect(lastPeriod.remainingPrincipal).toBe(0);
        expect(lastPeriod.totalPayment).toBe(1050); // Coupon + principal
      });

      it('should correctly accumulate interest over time', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 6,
          marketPrice: 1000,
          yearsToMaturity: 3,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert: Cumulative interest should increase by coupon amount each period
        expect(result.cashflowSchedule[0].cumulativeInterest).toBe(60);
        expect(result.cashflowSchedule[1].cumulativeInterest).toBe(120);
        expect(result.cashflowSchedule[2].cumulativeInterest).toBe(180);
        expect(result.cashflowSchedule[2].cumulativeInterest).toBe(
          result.totalInterestEarned,
        );
      });
    });

    describe('Validation', () => {
      it('should throw error for negative face value', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: -1000,
          annualCouponRate: 5,
          marketPrice: 1000,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act & Assert
        expect(() => service.calculateBondValue(input)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for zero face value', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 0,
          annualCouponRate: 5,
          marketPrice: 1000,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act & Assert
        expect(() => service.calculateBondValue(input)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for negative market price', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: -950,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act & Assert
        expect(() => service.calculateBondValue(input)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for negative years to maturity', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5,
          marketPrice: 950,
          yearsToMaturity: -10,
          couponFrequency: 'annual',
        };

        // Act & Assert
        expect(() => service.calculateBondValue(input)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for coupon rate > 100%', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 150,
          marketPrice: 950,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act & Assert
        expect(() => service.calculateBondValue(input)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for negative coupon rate', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: -5,
          marketPrice: 950,
          yearsToMaturity: 10,
          couponFrequency: 'annual',
        };

        // Act & Assert
        expect(() => service.calculateBondValue(input)).toThrow(
          BadRequestException,
        );
      });
    });

    describe('Rounding and Precision', () => {
      it('should round yields to 4 decimal places', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5.123456,
          marketPrice: 987.654321,
          yearsToMaturity: 10,
          couponFrequency: 'semi-annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert: Check precision
        const yieldString = result.currentYield.toString();
        const decimalPlaces = yieldString.split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(4);
      });

      it('should round currency to 2 decimal places', () => {
        // Arrange
        const input: CalculateBondDto = {
          faceValue: 1000,
          annualCouponRate: 5.123,
          marketPrice: 1000,
          yearsToMaturity: 1,
          couponFrequency: 'annual',
        };

        // Act
        const result = service.calculateBondValue(input);

        // Assert
        expect(result.cashflowSchedule[0].couponPayment).toBe(51.23);
        expect(result.totalInterestEarned).toBe(51.23);
      });
    });
  });
});
