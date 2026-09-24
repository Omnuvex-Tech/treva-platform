import { Module } from '@nestjs/common';
import { BrokerRoleController } from './broker-role.controller';
import { BrokerRoleService } from './broker-role.service';

@Module({
  controllers: [BrokerRoleController],
  providers: [BrokerRoleService],
})
export class BrokerRoleModule {}
