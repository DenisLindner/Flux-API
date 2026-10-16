import { BadRequestException } from '@nestjs/common';

export type ImageFile = {
  buffer: Buffer;
  mimetype: string;
};

export const maxImageSize = 5 * 1024 * 1024;

/**
 * Valida o tamanho e a assinatura binária da imagem e devolve o MIME detectado.
 * O MIME informado pelo cliente precisa coincidir com o conteúdo real.
 */
export function validateImage(image: ImageFile) {
  const data = image.buffer;
  if (data.length > maxImageSize) {
    throw new BadRequestException('A imagem deve ter no máximo 5 MB');
  }

  const isJpeg =
    data.length >= 3 &&
    data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const isPng =
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp =
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP';
  const detectedMimeType = isJpeg
    ? 'image/jpeg'
    : isPng
      ? 'image/png'
      : isWebp
        ? 'image/webp'
        : null;

  if (!detectedMimeType || detectedMimeType !== image.mimetype) {
    throw new BadRequestException('Envie uma imagem JPEG, PNG ou WebP válida');
  }

  return detectedMimeType;
}
