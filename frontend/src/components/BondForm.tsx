/**
 * Bond Form Component
 *
 * Handles user input for bond parameters with validation.
 * Uses controlled components and separates UI from business logic.
 */

import { useState, FormEvent } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import {
  validateBondForm,
  type BondFormData,
  type BondFormErrors,
} from '../utils/validation';
import type { BondCalculationRequest } from '../types/bond.types';

interface BondFormProps {
  onSubmit: (request: BondCalculationRequest) => void;
  loading: boolean;
}

export function BondForm({ onSubmit, loading }: BondFormProps): JSX.Element {
  // Form state (controlled components)
  const [formData, setFormData] = useState<BondFormData>({
    faceValue: '1000',
    annualCouponRate: '5',
    marketPrice: '950',
    yearsToMaturity: '10',
    couponFrequency: 'semi-annual',
    settlementDate: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<BondFormErrors>({});

  // Handle individual field changes
  const handleChange = (field: keyof BondFormData) => (value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field as keyof BondFormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof BondFormErrors];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validate form
    const validation = validateBondForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Convert to API request format
    const request: BondCalculationRequest = {
      faceValue: parseFloat(formData.faceValue),
      annualCouponRate: parseFloat(formData.annualCouponRate),
      marketPrice: parseFloat(formData.marketPrice),
      yearsToMaturity: parseFloat(formData.yearsToMaturity),
      couponFrequency: formData.couponFrequency,
      settlementDate: formData.settlementDate || undefined,
    };

    onSubmit(request);
  };

  return (
    <Card title="Bond Parameters">
      <form onSubmit={handleSubmit}>
        <Input
          id="faceValue"
          label="Face Value"
          type="number"
          value={formData.faceValue}
          onChange={handleChange('faceValue')}
          error={errors.faceValue}
          required
          step="0.01"
          placeholder="1000"
        />

        <Input
          id="annualCouponRate"
          label="Annual Coupon Rate"
          type="number"
          value={formData.annualCouponRate}
          onChange={handleChange('annualCouponRate')}
          error={errors.annualCouponRate}
          required
          step="0.01"
          min="0"
          max="100"
          placeholder="5"
          helpText="Enter as percentage (e.g., 5 for 5%)"
        />

        <Input
          id="marketPrice"
          label="Market Price"
          type="number"
          value={formData.marketPrice}
          onChange={handleChange('marketPrice')}
          error={errors.marketPrice}
          required
          step="0.01"
          placeholder="950"
        />

        <Input
          id="yearsToMaturity"
          label="Years to Maturity"
          type="number"
          value={formData.yearsToMaturity}
          onChange={handleChange('yearsToMaturity')}
          error={errors.yearsToMaturity}
          required
          step="0.01"
          placeholder="10"
        />

        <Select
          id="couponFrequency"
          label="Coupon Frequency"
          value={formData.couponFrequency}
          onChange={handleChange('couponFrequency')}
          options={[
            { value: 'annual', label: 'Annual' },
            { value: 'semi-annual', label: 'Semi-Annual' },
          ]}
          required
        />

        <Input
          id="settlementDate"
          label="Settlement Date"
          type="date"
          value={formData.settlementDate}
          onChange={handleChange('settlementDate')}
          error={errors.settlementDate}
          helpText="Optional - defaults to today"
        />

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Bond'}
        </Button>
      </form>
    </Card>
  );
}
