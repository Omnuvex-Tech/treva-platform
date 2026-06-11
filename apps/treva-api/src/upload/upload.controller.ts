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
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const uploadsServeRoot = process.env.UPLOADS_SERVE_ROOT ?? '/uploads';
const uploadsDir = join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads');
const imagesDir = join(uploadsDir, 'images');
const documentsDir = join(uploadsDir, 'documents');
const maxFileSizeBytes = Number(
  process.env.UPLOAD_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024,
);

[uploadsDir, imagesDir, documentsDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const storage = diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    cb(null, isImage ? imagesDir : documentsDir);
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
  const allowedDocTypes = ['application/pdf'];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedDocTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        'Only images (JPEG, PNG, WebP, GIF) and PDFs are allowed',
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
      limits: { fileSize: maxFileSizeBytes },
    }),
  )
  @ApiOperation({ summary: 'Upload a file (image or PDF)' })
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

    const isImage = file.mimetype.startsWith('image/');
    const url = `${uploadsServeRoot}/${isImage ? 'images' : 'documents'}/${file.filename}`;

    return {
      url,
      alt: file.originalname,
      type: isImage ? 'image' : 'document',
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
