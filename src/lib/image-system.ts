// Advanced image system for WeChat content - URL-based approach

export type ImageSource =
  | "ai-dashscope"
  | "ai-modelscope"
  | "picsum"
  | "placeholder"
  | "gradient"
  | "pattern";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface ImageConfig {
  source: ImageSource;
  aspectRatio: AspectRatio;
  apiKey?: string;
}

export const gradientStyles = {
  blue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  purple: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  sunset: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  forest: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  aurora: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  fire: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  midnight: "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)",
};

export const patternStyles = {
  dots: `data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23000' opacity='0.1'/%3E%3C/svg%3E`,
  lines: `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0' stroke='%23000' stroke-width='1' opacity='0.1'/%3E%3C/svg%3E`,
};

export function getAspectRatioDimensions(
  ratio: AspectRatio,
  baseWidth: number = 800,
): { width: number; height: number } {
  switch (ratio) {
    case "1:1":
      return { width: baseWidth, height: baseWidth };
    case "16:9":
      return { width: baseWidth, height: Math.round((baseWidth * 9) / 16) };
    case "9:16":
      return { width: baseWidth, height: Math.round((baseWidth * 16) / 9) };
    case "4:3":
      return { width: baseWidth, height: Math.round((baseWidth * 3) / 4) };
    case "3:4":
      return { width: baseWidth, height: Math.round((baseWidth * 4) / 3) };
  }
}

export function generatePicsumUrl(config: ImageConfig): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio);
  return `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
}

export function generatePlaceholderUrl(
  config: ImageConfig,
  text: string = "Image",
): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio);
  return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
}

export function generateGradientStyle(
  gradientType: keyof typeof gradientStyles,
  config: ImageConfig,
): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio);
  const gradient = gradientStyles[gradientType];

  return `background: ${gradient}; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;`;
}

export function generatePatternStyle(
  patternType: keyof typeof patternStyles,
  config: ImageConfig,
): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio);
  const pattern = patternStyles[patternType];

  return `background: #f0f0f0 url("${pattern}") repeat; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 24px; font-weight: bold;`;
}

export async function generateAIImage(
  description: string,
  config: ImageConfig,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return generatePlaceholderUrl(config, `AI: ${description.substring(0, 20)}`);
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// SM.MS - Free image hosting, no auth required
export async function uploadToSMMS(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("smfile", file);

    const response = await fetch("https://sm.ms/api/v2/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        url: data.data.url, // Direct URL
      };
    } else {
      // SM.MS may return success: false with different message format
      return {
        success: false,
        error: data.images || data.msg || "Upload failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// ImgBB - Free image hosting, no auth required (up to 50 images/day from same IP)
export async function uploadToImgBB(file: File): Promise<UploadResult> {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // ImgBB API requires base64 data without the data:image/...;base64, prefix
    const base64Data = base64.split(",")[1];

    const formData = new FormData();
    formData.append("image", base64Data);

    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=d36eb6591370aa09177e971096f3d713",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        url: data.data.url, // Direct URL
      };
    } else {
      return {
        success: false,
        error: data.error?.message || "Upload failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Catbox.moe - Free, no rate limit, permanent storage
export async function uploadToCatbox(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", file);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    const url = await response.text();

    // Catbox returns URL directly if successful
    if (url.startsWith("https://")) {
      return {
        success: true,
        url: url,
      };
    } else {
      return {
        success: false,
        error: url || "Upload failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Upload to a specific image bed
export type ImageBed = "smms" | "imgbb" | "catbox";

export async function uploadToImageBed(
  file: File,
  bed: ImageBed,
): Promise<UploadResult> {
  switch (bed) {
    case "smms":
      return uploadToSMMS(file);
    case "imgbb":
      return uploadToImgBB(file);
    case "catbox":
      return uploadToCatbox(file);
    default:
      return { success: false, error: "Unknown image bed" };
  }
}

// Get image bed name for display
export function getImageBedName(bed: ImageBed): string {
  switch (bed) {
    case "smms":
      return "SM.MS";
    case "imgbb":
      return "ImgBB";
    case "catbox":
      return "Catbox";
    default:
      return bed;
  }
}

export interface ImageLibraryItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  aspectRatio?: AspectRatio;
  caption?: string;
  addedAt: Date;
  tags: string[];
  thumbnail?: string; // For lazy loading, can be same as url for URLs
}

export class ImageLibrary {
  private items: ImageLibraryItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  add(item: Omit<ImageLibraryItem, "id" | "addedAt">): ImageLibraryItem {
    // Check if URL already exists
    const existing = this.items.find((i) => i.url === item.url);
    if (existing) {
      return existing;
    }

    const newItem: ImageLibraryItem = {
      ...item,
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date(),
    };

    this.items.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  remove(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  get(id: string): ImageLibraryItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  getByUrl(url: string): ImageLibraryItem | undefined {
    return this.items.find((item) => item.url === url);
  }

  getAll(): ImageLibraryItem[] {
    return [...this.items];
  }

  update(
    id: string,
    updates: Partial<ImageLibraryItem>,
  ): ImageLibraryItem | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updates };
      this.saveToStorage();
      return this.items[index];
    }
    return undefined;
  }

  search(query: string): ImageLibraryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(
      (item) =>
        item.filename.toLowerCase().includes(lowerQuery) ||
        item.url.toLowerCase().includes(lowerQuery) ||
        item.alt.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        (item.caption && item.caption.toLowerCase().includes(lowerQuery)),
    );
  }

  // Get markdown syntax for inserting
  getMarkdown(item: ImageLibraryItem): string {
    let syntax = item.alt
      ? `[IMAGE: ${item.url}|${item.alt}`
      : `[IMAGE: ${item.url}`;

    syntax += item.aspectRatio ? `|${item.aspectRatio}` : `|`;
    syntax += item.caption ? `|${item.caption}` : "";
    syntax += `]`;

    return syntax;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("markpolish_image_library");
      if (stored) {
        this.items = JSON.parse(stored).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
      }
    } catch (error) {
      console.error("Failed to load image library:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        "markpolish_image_library",
        JSON.stringify(this.items),
      );
    } catch (error) {
      console.error("Failed to save image library:", error);
    }
  }
}

export const imageLibrary = new ImageLibrary();

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validProtocols = ["http:", "https:"];
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];

    if (!validProtocols.includes(parsed.protocol)) {
      return false;
    }

    // Check if URL path ends with valid image extension
    const pathname = parsed.pathname.toLowerCase();
    return validExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

export function extractFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const filename = pathname.split("/").pop() || "image";
    return decodeURIComponent(filename);
  } catch {
    return "image";
  }
}
