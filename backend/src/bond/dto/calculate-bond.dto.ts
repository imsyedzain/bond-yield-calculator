import {
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsIn,
  IsOptional,
  Matches,
} from 'class-validator';

export class CalculateBondDto {
  @IsNumber()
  @IsPositive()
  faceValue!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  annualCouponRate!: number;

  @IsNumber()
  @IsPositive()
  marketPrice!: number;

  @IsNumber()
  @IsPositive()
  yearsToMaturity!: number;

  @IsIn(['annual', 'semi-annual'])
  couponFrequency!: 'annual' | 'semi-annual';

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'settlementDate must be in ISO format (YYYY-MM-DD)',
  })
  settlementDate?: string;
}
