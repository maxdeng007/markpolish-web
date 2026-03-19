import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { imageLibrary, type ImageLibraryItem } from "@/lib/image-system";
import { Upload, Trash2, Copy, Search, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ImageLibraryPanelProps {
  onInsertImage: (url: string, filename: string) => void;
}

export default function ImageLibraryPanel({
  onInsertImage,
}: ImageLibraryPanelProps) {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageLibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    setImages(imageLibrary.getAll());
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      try {
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          imageLibrary.add({
            filename: file.name,
            url,
            description: "",
            tags: [],
          });
          loadImages();
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t("images.deleteImage"))) {
      imageLibrary.remove(id);
      loadImages();
    }
  };

  const handleInsert = (image: ImageLibraryItem) => {
    onInsertImage(image.url, image.filename);
    alert(t("images.imageMarkdownInserted"));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert(t("images.copyUrl"));
  };

  const filteredImages = searchQuery
    ? imageLibrary.search(searchQuery)
    : images;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">
          {t("images.imageLibrary")}
        </h3>

        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="image-upload"
          />
          <Button
            onClick={() => document.getElementById("image-upload")?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t("images.uploadImages")}
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("images.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        {filteredImages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("images.noImages")}</p>
            <p className="text-xs">{t("images.uploadToStart")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedImage === image.id
                    ? "ring-2 ring-primary shadow-lg"
                    : ""
                }`}
                onClick={() => setSelectedImage(image.id)}
              >
                <div className="aspect-square bg-muted relative group">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-2.5">
                  <div
                    className="text-xs font-medium truncate mb-2.5"
                    title={image.filename}
                  >
                    {image.filename}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsert(image);
                      }}
                      className="h-8 px-2.5"
                      title={t("images.insert")}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(image.url);
                      }}
                      className="h-8 px-2.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="h-8 px-2.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-xs mb-2">
            {t("images.imageDetails")}
          </h4>
          {(() => {
            const image = images.find((img) => img.id === selectedImage);
            if (!image) return null;
            return (
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-muted-foreground">
                    {t("images.filename")}:
                  </span>
                  <div className="font-mono">{image.filename}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("images.added")}:
                  </span>
                  <div>{image.addedAt.toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("images.markdown")}:
                  </span>
                  <div className="font-mono bg-muted p-2 rounded text-[10px] break-all">
                    [LOCAL: {image.filename}]
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
