import { Module } from '@nestjs/common';
import { BitrixModule } from '../bitrix/bitrix.module';
import { CompaniesModule } from '../companies/companies.module';
import { AgenciesController, UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [BitrixModule, CompaniesModule],
  controllers: [UsersController, AgenciesController],
  providers: [UsersService],
})
export class UsersModule {}
