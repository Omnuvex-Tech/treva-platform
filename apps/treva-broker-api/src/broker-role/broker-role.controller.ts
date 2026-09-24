import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt.strategy';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { UPLOADS_DIR } from '../uploads/uploads.controller';
import { BrokerRoleService } from './broker-role.service';
import {
  CreateDocumentDto,
  DocumentListQueryDto,
  UpdateDocumentDto,
} from './dto/documents.dto';

type AuthedRequest = { user: AuthUser };

/** What the Add Files modal's own hint promises: "…up to 60MB". */
const MAX_FILE_BYTES = 60 * 1024 * 1024;

/**
 * Everything the Add Files modal (873:49824) offers — its hint promises JPEG,
 * PNG, PDF and MP4 — plus the office formats the library itself is made of
 * (the artboard's own list carries a .pptx). A file the picker offers must
 * never be refused here, so this stays a superset of that hint.
 */
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'video/mp4',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const DOCUMENTS_DIR = join(UPLOADS_DIR, 'documents');

/**
 * Broker Role — the shared materials library, not role administration. See the
 * note in treva-broker's features/brokers/types.ts for why the name and the
 * content differ.
 *
 * Every role reads (`brokers:read` is the baseline); adding and editing are
 * `brokers:create` / `brokers:update`, which is top brokers and admins.
 * Deleting is allowed to the same two rather than to admins alone, because the
 * row draws its delete chip behind `brokers:update` — a button the screen shows
 * must not answer 403.
 */
@ApiTags('broker-role')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('broker-role/documents')
export class BrokerRoleController {
  constructor(private readonly brokerRoleService: BrokerRoleService) {}

  @Get()
  @ApiOperation({ summary: 'The materials library, most recent first' })
  list(@Request() req: AuthedRequest, @Query() query: DocumentListQueryDto) {
    return this.brokerRoleService.list(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One file' })
  @ApiResponse({ status: 404, description: 'No such file, or not visible' })
  detail(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.brokerRoleService.detail(req.user, id);
  }

  /**
   * Multipart rather than a JSON body beside a separate /uploads call: the
   * modal sends one file and one name, /uploads is admin-only, and a row
   * without its bytes is a broken download waiting to happen.
   */
  @Post()
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Store a file and add it to the library' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
        cb(new BadRequestException('This file type is not allowed'), false);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(DOCUMENTS_DIR)) {
            mkdirSync(DOCUMENTS_DIR, { recursive: true });
          }
          cb(null, DOCUMENTS_DIR);
        },
        // Never the client's name on disk: it decides nothing but the extension.
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase().slice(0, 10);
          cb(null, `${Date.now()}-${randomUUID()}${ext}`);
        },
      }),
    }),
  )
  create(
    @Request() req: AuthedRequest,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file was sent');
    }

    return this.brokerRoleService.create(req.user, file, dto.name);
  }

  @Patch(':id')
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Edit a file’s details and visibility' })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.brokerRoleService.update(id, dto);
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Count a download; answers with the updated file' })
  @ApiResponse({ status: 403, description: 'Downloads are off for this file' })
  registerDownload(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.brokerRoleService.registerDownload(req.user, id);
  }

  @Delete(':id')
  @Roles('top_broker', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file and its bytes' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.brokerRoleService.remove(id);
  }
}
