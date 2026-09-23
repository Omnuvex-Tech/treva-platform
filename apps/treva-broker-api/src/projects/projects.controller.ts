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
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt.strategy';
import { Roles, RolesGuard } from '../auth/roles.guard';
import {
  UPLOADS_DIR,
  UPLOADS_ROUTE,
  type UploadedFileResponse,
} from '../uploads/uploads.controller';
import { InventorySyncService } from '../inventory/inventory-sync.service';
import { ProjectListQueryDto, SaveProjectDto } from './dto/projects.dto';
import { PROJECT_IMAGES_FOLDER, ProjectsService } from './projects.service';

type AuthedRequest = { user: AuthUser };

/** A well-shot 1104x368 hero is a few MB; leave headroom. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** What the gallery's own picker accepts (`image/jpeg,image/png,image/webp`). */
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * The extension on disk follows the checked type, not the client's file name:
 * a PNG named `x.html` would otherwise be served back as a page.
 */
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
};

/** A Key Highlights icon is drawn at 20px; nothing that small needs more. */
const MAX_ICON_BYTES = 1024 * 1024;

/**
 * The gallery's types plus SVG, the usual shape of an icon. A stored SVG is
 * only safe because main.ts serves every `.svg` under a sandboxing CSP — it is
 * reachable on treva-broker's own origin through its /uploads rewrite.
 */
const ICON_TYPES = new Set([...IMAGE_TYPES, 'image/svg+xml']);

/** Marketing Materials: what its picker offers (JPEG, PNG, PDF, MP4), up to 60 MB. */
const MAX_MATERIAL_BYTES = 60 * 1024 * 1024;
const MATERIAL_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'video/mp4',
]);

const IMAGES_DIR = join(UPLOADS_DIR, PROJECT_IMAGES_FOLDER);

/** One multipart `file` into IMAGES_DIR, refused unless its type is allowed. */
function fileUpload(types: ReadonlySet<string>, maxBytes: number) {
  return FileInterceptor('file', {
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (types.has(file.mimetype)) return cb(null, true);
      cb(new BadRequestException('This file type is not allowed'), false);
    },
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!existsSync(IMAGES_DIR)) {
          mkdirSync(IMAGES_DIR, { recursive: true });
        }
        cb(null, IMAGES_DIR);
      },
      // Never the client's name on disk, nor its extension.
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${randomUUID()}${EXTENSIONS[file.mimetype]}`);
      },
    }),
  });
}

function storedFile(file?: Express.Multer.File): UploadedFileResponse {
  if (!file) {
    throw new BadRequestException('No file was sent');
  }

  return {
    url: `${UPLOADS_ROUTE}/${PROJECT_IMAGES_FOLDER}/${file.filename}`,
    // Multer decodes multipart names as latin1; browsers send UTF-8.
    name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
    sizeBytes: file.size,
    mimeType: file.mimetype,
  };
}

const FILE_BODY: Parameters<typeof ApiBody>[0] = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: { file: { type: 'string', format: 'binary' } },
  },
};

/**
 * Every role reads projects (`projects:read`). Creating and editing are
 * `projects:create` / `projects:update` — top brokers and admins — and
 * deleting is `projects:delete`, which only an admin holds.
 */
@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly inventorySync: InventorySyncService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Projects, most recently changed first' })
  list(@Query() query: ProjectListQueryDto) {
    return this.projectsService.list(query);
  }

  /**
   * The Synchronize button: copies treva-api's off-plan objects, buildings and
   * units into this API's database. Same roles as adding a project, since a
   * sync creates projects.
   */
  @Post('sync')
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Synchronise projects and units from treva-api' })
  @ApiResponse({ status: 409, description: 'A sync is already running' })
  @ApiResponse({ status: 502, description: 'treva-api could not be read' })
  sync(@Request() req: AuthedRequest) {
    return this.inventorySync.sync(req.user);
  }

  /**
   * The editor's image wells. Its own endpoint rather than /uploads, which is
   * admin-only: a top broker edits projects and has to be able to fill them.
   */
  @Post('images')
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Store one gallery image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_BODY)
  @ApiResponse({ status: 201, description: 'Stored; returns its URL' })
  @UseInterceptors(fileUpload(IMAGE_TYPES, MAX_IMAGE_BYTES))
  uploadImage(
    @UploadedFile() file?: Express.Multer.File,
  ): UploadedFileResponse {
    return storedFile(file);
  }

  /** A Key Highlights row's own icon, in place of its kind's glyph. */
  @Post('icons')
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Store one Key Highlights icon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_BODY)
  @ApiResponse({ status: 201, description: 'Stored; returns its URL' })
  @UseInterceptors(fileUpload(ICON_TYPES, MAX_ICON_BYTES))
  uploadIcon(@UploadedFile() file?: Express.Multer.File): UploadedFileResponse {
    return storedFile(file);
  }

  /** A Marketing Materials file; the row itself is saved with the project. */
  @Post('materials')
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Store one Marketing Materials file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_BODY)
  @ApiResponse({ status: 201, description: 'Stored; returns its URL' })
  @UseInterceptors(fileUpload(MATERIAL_TYPES, MAX_MATERIAL_BYTES))
  uploadMaterial(
    @UploadedFile() file?: Express.Multer.File,
  ): UploadedFileResponse {
    return storedFile(file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One project' })
  @ApiResponse({ status: 404, description: 'No such project' })
  detail(@Param('id') id: string) {
    return this.projectsService.detail(id);
  }

  @Post()
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Add a project' })
  create(@Request() req: AuthedRequest, @Body() dto: SaveProjectDto) {
    return this.projectsService.create(req.user, dto);
  }

  @Patch(':id')
  @Roles('top_broker', 'admin')
  @ApiOperation({ summary: 'Save the editor' })
  update(@Param('id') id: string, @Body() dto: SaveProjectDto) {
    return this.projectsService.update(id, dto);
  }

  /** Every role reads projects, so every role may download their files. */
  @Post(':id/materials/:materialId/download')
  @ApiOperation({ summary: 'Count a Marketing Materials download' })
  @ApiResponse({ status: 404, description: 'No such project or file' })
  registerMaterialDownload(
    @Param('id') id: string,
    @Param('materialId') materialId: string,
  ) {
    return this.projectsService.registerMaterialDownload(id, materialId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project and its stored images' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }
}
