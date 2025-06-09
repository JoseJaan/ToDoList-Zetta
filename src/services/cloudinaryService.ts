import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {

  static async uploadImage(
    fileBuffer: Buffer,
    publicId?: string,
    folder: string = 'profile-images'
  ): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            public_id: publicId,
            folder: folder,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Erro no upload para Cloudinary:', error);
              reject(new Error('Erro ao fazer upload da imagem'));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Resultado inesperado do Cloudinary'));
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      console.error('Erro no serviço Cloudinary:', error);
      throw new Error('Erro interno do servidor ao processar imagem');
    }
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result !== 'ok') {
        console.warn('Imagem não encontrada no Cloudinary ou já foi deletada:', publicId);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem do Cloudinary:', error);
      throw new Error('Erro ao deletar imagem');
    }
  }

  static extractPublicId(cloudinaryUrl: string): string | null {
    try {
      const matches = cloudinaryUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/i);
      if (matches && matches[1]) {
        return matches[1];
      }
      
      const transformationMatches = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i);
      if (transformationMatches && transformationMatches[1]) {
        return transformationMatches[1];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao extrair public_id:', error);
      return null;
    }
  }
}