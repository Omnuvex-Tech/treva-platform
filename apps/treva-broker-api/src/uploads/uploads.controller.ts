import {
  BadRequestException,
  Controller,
  Post,
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
  ApiTags,
} from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

/**
 * Where every stored file lives on disk: `uploads/` beside the app (the npm
 * scripts run from apps/treva-broker-api), or UPLOADS_DIR when set. The root
 * .gitignore keeps these runtime files out of git.
 *
 * Features file under their own folder in here — `documents/` (Broker Role),
 * `projects/…`, `synced/` (inventory sync) and `news/` (this endpoint).
 */
export const UPLOADS_DIR = resolve(
  process.env.UPLOADS_DIR?.trim() || join(process.cwd(), 'uploads'),
);

/**
 * The public path main.ts serves UPLOADS_DIR under — outside the API prefix,
 * and rewritten by treva-broker on its own origin — so a stored URL is
 * root-relative (`/uploads/news/…`) and works behind any host.
 */
export const UPLOADS_ROUTE = '/uploads';

/** What every upload endpoint answers: treva-broker's `UploadedFile`. */
export interface UploadedFileResponse {
  /** Root-relative, under UPLOADS_ROUTE. */
  url: string;
  /** The name the file had on the uploader's machine. */
  name: string;
  sizeBytes: number;
  mimeType: string;
}

/** What the News editor's attachment hint promises: "Max 25 MB". */
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export const NEWS_UPLOADS_FOLDER = 'news';
const NEWS_DIR = join(UPLOADS_DIR, NEWS_UPLOADS_FOLDER);

/**
 * The News editor's pickers: images for the cover, and "PDF, Word, Excel, or
 * Images" for attachments. The extension on disk follows the checked type,
 * never the client's file name — a PNG named `x.html` would otherwise be served
 * back as a page. An SVG is safe only because main.ts serves every `.svg`
 * under a sandboxing CSP.
 */
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

/**
 * One general-purpose upload: the News editor's cover image and attachments.
 * Admin-only, like writing news. Features with their own rules (Broker Role's
 * library, the project editor's images) take files on their own endpoints.
 */
@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uploads')
export class UploadsController {
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Store one file and return its public URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (EXTENSIONS[file.mimetype]) return cb(null, true);
        cb(new BadRequestException('This file type is not allowed'), false);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(NEWS_DIR)) mkdirSync(NEWS_DIR, { recursive: true });
          cb(null, NEWS_DIR);
        },
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-${randomUUID()}${EXTENSIONS[file.mimetype]}`);
        },
      }),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File): UploadedFileResponse {
    if (!file) {
      throw new BadRequestException('No file was sent');
    }

    return {
      url: `${UPLOADS_ROUTE}/${NEWS_UPLOADS_FOLDER}/${file.filename}`,
      // Multer decodes multipart names as latin1; browsers send UTF-8.
      name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      sizeBytes: file.size,
      mimeType: file.mimetype,
    };
  }
}
