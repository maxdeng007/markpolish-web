import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  imageLibrary,
  type ImageLibraryItem,
  isValidImageUrl,
  extractFilenameFromUrl,
  type AspectRatio,
} from "@/lib/image-system";
import {
  Trash2,
  Copy,
  Search,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

interface ImageLibraryPanelProps {
  onInsertImage: (url: string, filename: string) => void;
}

const ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export default function ImageLibraryPanel({
  onInsertImage,
}: ImageLibraryPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [images, setImages] = useState<ImageLibraryItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showLibrary, setShowLibrary] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editRatio, setEditRatio] = useState<AspectRatio | "">("");
  const [editCaption, setEditCaption] = useState("");

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    setImages(imageLibrary.getAll());
  };

  const handleUrlInsert = () => {
    if (!urlInput.trim()) return;

    const url = urlInput.trim();

    if (!isValidImageUrl(url)) {
      showToast(t("images.invalidUrl"), "error");
      return;
    }

    const filename = extractFilenameFromUrl(url);

    imageLibrary.add({
      url,
      filename,
      alt: "",
      tags: [],
    });
    loadImages();

    onInsertImage(url, filename);
    showToast(t("images.inserted"), "success");
    setUrlInput("");
  };

  const handleDelete = (id: string) => {
    imageLibrary.remove(id);
    if (selectedImage === id) {
      setSelectedImage(null);
    }
    loadImages();
  };

  const handleInsertFromLibrary = (image: ImageLibraryItem) => {
    onInsertImage(image.url, image.filename);
    showToast(t("images.inserted"), "success");
  };

  const handleCopyMarkdown = (image: ImageLibraryItem) => {
    const markdown = imageLibrary.getMarkdown(image);
    navigator.clipboard.writeText(markdown);
    showToast(t("common.copied"), "success");
  };

  const handleSaveEdit = () => {
    if (!selectedImage) return;

    imageLibrary.update(selectedImage, {
      alt: editAlt,
      aspectRatio: editRatio || undefined,
      caption: editCaption,
    });

    loadImages();
    showToast(t("images.saved"), "success");
  };

  const handleSelectImage = (image: ImageLibraryItem) => {
    setSelectedImage(image.id);
    setEditAlt(image.alt || "");
    setEditRatio(image.aspectRatio || "");
    setEditCaption(image.caption || "");
  };

  const filteredImages = searchQuery
    ? imageLibrary.search(searchQuery)
    : images;

  const selectedItem = selectedImage
    ? images.find((img) => img.id === selectedImage)
    : null;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-sm">{t("images.imageLibrary")}</h3>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-medium">
          {t("images.pasteUrlDirect")}
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleUrlInsert()}
          />
          <Button
            onClick={handleUrlInsert}
            size="sm"
            disabled={!urlInput.trim()}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {t("images.urlInsertHint")}
        </p>
      </div>

      <div className="border-t border-border pt-3">
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <span>
            {t("images.savedImages")} ({images.length})
          </span>
          {showLibrary ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showLibrary && (
          <div className="mt-3 space-y-3">
            {images.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("images.searchPlaceholder")}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            )}

            {filteredImages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{t("images.noImages")}</p>
                <p className="text-[10px] mt-1">{t("images.pasteUrlHint")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      "border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md",
                      selectedImage === image.id ? "ring-2 ring-primary" : "",
                    )}
                    onClick={() => handleSelectImage(image)}
                  >
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={image.url}
                        alt={image.alt || image.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-1.5">
                      <p
                        className="text-[10px] truncate"
                        title={image.filename}
                      >
                        {image.filename}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertFromLibrary(image);
                          }}
                          className="h-6 px-1 flex-1"
                          title={t("images.insert")}
                        >
                          <ImageIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(image.id);
                          }}
                          className="h-6 px-1 text-destructive hover:text-destructive"
                          title={t("images.delete")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedItem && (
              <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate flex-1">
                    {selectedItem.filename}
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="h-7 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {t("common.save")}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">
                      {t("images.alt")}
                    </label>
                    <Input
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder={t("images.altPlaceholder")}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">
                      {t("images.caption")}
                    </label>
                    <Input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder={t("images.captionPlaceholder")}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">
                    {t("images.aspectRatio")}
                  </label>
                  <div className="flex gap-1">
                    {ASPECT_RATIOS.map((ratio) => (
                      <Button
                        key={ratio}
                        size="sm"
                        variant={editRatio === ratio ? "default" : "outline"}
                        className="h-6 px-2 text-[10px] flex-1"
                        onClick={() =>
                          setEditRatio(editRatio === ratio ? "" : ratio)
                        }
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => handleCopyMarkdown(selectedItem)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {t("images.copyMarkdown")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
