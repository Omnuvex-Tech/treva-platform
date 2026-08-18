import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const uploadsServeRoot = process.env.UPLOADS_SERVE_ROOT ?? '/uploads';
const uploadsDir = join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads');
const imagesDir = join(uploadsDir, 'images');
const videosDir = join(uploadsDir, 'videos');
const documentsDir = join(uploadsDir, 'documents');
const maxFileSizeBytes = Number(
  process.env.UPLOAD_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024,
);
// Video needs its own ceiling: a clip that counts as small for video is still
// many times the size any picture here is allowed to be.
const maxVideoSizeBytes = Number(
  process.env.UPLOAD_MAX_VIDEO_SIZE_BYTES ?? 100 * 1024 * 1024,
);

[uploadsDir, imagesDir, videosDir, documentsDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const mediaKindOf = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return 'image' as const;
  if (mimetype.startsWith('video/')) return 'video' as const;
  return 'document' as const;
};

const directoryFor = {
  image: imagesDir,
  video: videosDir,
  document: documentsDir,
};

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, directoryFor[mediaKindOf(file.mimetype)]);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  const allowedVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ];
  const allowedDocTypes = ['application/pdf'];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype) ||
    allowedDocTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        'Only images (JPEG, PNG, WebP, GIF), videos (MP4, WebM, OGG, MOV) and PDFs are allowed',
      ),
      false,
    );
  }
};

@ApiTags('upload')
@Controller()
export class UploadController {
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      // Multer applies one ceiling to the whole request, so it takes the larger
      // of the two and the handler holds everything else to the tighter limit.
      limits: { fileSize: Math.max(maxFileSizeBytes, maxVideoSizeBytes) },
    }),
  )
  @ApiOperation({ summary: 'Upload a file (image, video or PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const kind = mediaKindOf(file.mimetype);
    const sizeLimit = kind === 'video' ? maxVideoSizeBytes : maxFileSizeBytes;

    if (file.size > sizeLimit) {
      unlinkSync(file.path);
      throw new BadRequestException(
        `${kind === 'video' ? 'Videos' : 'Files'} may not exceed ${Math.round(sizeLimit / (1024 * 1024))}MB`,
      );
    }

    const url = `${uploadsServeRoot}/${kind}s/${file.filename}`;

    return {
      url,
      alt: file.originalname,
      type: kind,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
