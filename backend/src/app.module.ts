import { Module } from '@nestjs/common';
import { BondModule } from './bond/bond.module';
import { AppController } from './app.controller';

@Module({
  imports: [BondModule],
  controllers: [AppController],
})
export class AppModule {}
