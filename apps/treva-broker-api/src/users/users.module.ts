import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { AgenciesController, UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [CompaniesModule],
  controllers: [UsersController, AgenciesController],
  providers: [UsersService],
})
export class UsersModule {}
