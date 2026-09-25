import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';

/** `POST /uploads` — see UploadsController. Serving is main.ts's job. */
@Module({
  controllers: [UploadsController],
})
export class UploadsModule {}
