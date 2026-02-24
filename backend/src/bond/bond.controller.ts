import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BondService } from './bond.service';
import { CalculateBondDto } from './dto/calculate-bond.dto';
import { BondResultDto } from './dto/bond-result.dto';


@Controller('bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  calculate(@Body() dto: CalculateBondDto): BondResultDto {
    return this.bondService.calculateBondValue(dto);
  }
}