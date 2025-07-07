
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  type: 'profile' | 'car';
  userId: string;
}

const ImageUpload = ({ currentImageUrl, onImageUploaded, type, userId }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImageUrl || '');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      onImageUploaded(publicUrl);
      toast.success('Imagem carregada com sucesso!');

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao carregar imagem');
      setPreview(currentImageUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    onImageUploaded('');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">
              {type === 'profile' ? 'Foto de Perfil' : 'Foto do Carro'}
            </h3>
            
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt={type === 'profile' ? 'Foto de perfil' : 'Foto do carro'}
                  className={`object-cover border-2 border-gray-200 ${
                    type === 'profile' 
                      ? 'w-32 h-32 rounded-full' 
                      : 'w-full h-48 rounded-lg'
                  }`}
                />
                <Button
                  onClick={removeImage}
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 ${
                  type === 'profile' ? 'w-32 h-32 mx-auto rounded-full' : 'h-48'
                }`}
              >
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm">
                  {type === 'profile' ? 'Adicionar foto' : 'Foto do carro'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <label htmlFor={`file-${type}`}>
              <Button
                as="span"
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Carregando...' : 'Escolher Imagem'}
              </Button>
            </label>
            <input
              id={`file-${type}`}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          <p className="text-xs text-gray-500 text-center">
            PNG, JPG ou WEBP. Máximo 5MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
