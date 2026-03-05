// AI Image Generation using ModelScope Z-Image-Turbo API
import { settingsManager } from "./settings";

// Helper to convert aspect ratio string to width/height
function getDimensionsFromRatio(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "1:1":
      return { width: 1024, height: 1024 };
    case "16:9":
      return { width: 1024, height: 576 };
    case "9:16":
      return { width: 576, height: 1024 };
    case "4:3":
      return { width: 1024, height: 768 };
    case "3:4":
      return { width: 768, height: 1024 };
    default:
      return { width: 1024, height: 1024 };
  }
}


export interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  taskId?: string;
  error?: string;
}

export interface ImageGenerationTask {
  taskId: string;
  status: "pending" | "running" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
}

class AIImageGeneration {
  // Use Vite proxy in development to bypass CORS
  private readonly API_BASE = import.meta.env.DEV
    ? "/api/modelscope/v1"
    : "https://api-inference.modelscope.cn/v1";
  private readonly MODEL = "Tongyi-MAI/Z-Image-Turbo";
  private apiKey: string | null = null;

  constructor() {
    // Load API key from localStorage or settingsManager
    this.loadApiKey();
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem("modelscope_api_key", key);
    // Also sync to settingsManager
    settingsManager.setImageProviderApiKey("modelscope", key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  private loadApiKey(): void {
    this.apiKey = localStorage.getItem("modelscope_api_key");
    // Also try loading from settingsManager
    if (!this.apiKey) {
      const settingsKey =
        settingsManager.getImageProvider("modelscope")?.apiKey;
      if (settingsKey) {
        this.apiKey = settingsKey;
      }
    }
  }

  hasApiKey(): boolean {
    // Check both local and settingsManager
    if (this.apiKey) return true;
    const settingsKey = settingsManager.getImageProvider("modelscope")?.apiKey;
    return !!settingsKey;
  }

  /**
   * Generate an image from a text prompt
   * This is an async operation that returns a task ID
   */
  async generateImage(
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    // Get API key from instance or settingsManager
    const apiKey =
      this.apiKey || settingsManager.getImageProvider("modelscope")?.apiKey;

    if (!apiKey) {
      return {
        success: false,
        error:
          "ModelScope API key not configured. Please add your API key in Settings > AI Images.",
      };
    }

    try {
      const dimensions = getDimensionsFromRatio(options.aspectRatio || "1:1");
      console.log("[API] Generating image with aspectRatio:", options.aspectRatio, "dimensions:", dimensions);
      const response = await fetch(`${this.API_BASE}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-ModelScope-Async-Mode": "true",
        },
        body: JSON.stringify({
          model: this.MODEL,
          prompt: options.prompt,
          // Send both aspect_ratio and width/height for compatibility
          aspect_ratio: options.aspectRatio || "1:1",
          width: dimensions.width,
          height: dimensions.height,
          num_inference_steps: options.numInferenceSteps || 9,
          guidance_scale: options.guidanceScale || 0.0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API Error (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();

      if (data.task_id) {
        return {
          success: true,
          taskId: data.task_id,
        };
      } else {
        return {
          success: false,
          error: "No task ID returned from API",
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Check the status of an image generation task
   */
  async checkTaskStatus(taskId: string): Promise<ImageGenerationTask> {
    // Get API key from instance or settingsManager
    const apiKey =
      this.apiKey || settingsManager.getImageProvider("modelscope")?.apiKey;

    if (!apiKey) {
      return {
        taskId,
        status: "failed",
        error: "API key not configured",
      };
    }

    try {
      const response = await fetch(`${this.API_BASE}/tasks/${taskId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-ModelScope-Task-Type": "image_generation",
        },
      });

      if (!response.ok) {
        return {
          taskId,
          status: "failed",
          error: `API Error (${response.status})`,
        };
      }

      const data = await response.json();

      // Map ModelScope status to our status
      const statusMap: Record<string, ImageGenerationTask["status"]> = {
        PENDING: "pending",
        RUNNING: "running",
        SUCCEED: "succeeded",
        FAILED: "failed",
      };

      const status = statusMap[data.task_status] || "pending";

      if (
        status === "succeeded" &&
        data.output_images &&
        data.output_images.length > 0
      ) {
        return {
          taskId,
          status: "succeeded",
          imageUrl: data.output_images[0],
        };
      }

      if (status === "failed") {
        return {
          taskId,
          status: "failed",
          error: data.error || "Generation failed",
        };
      }

      return {
        taskId,
        status,
      };
    } catch (error) {
      return {
        taskId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate image and poll until completion
   * This is a convenience method that handles the async workflow
   */
  async generateImageAndWait(
    options: ImageGenerationOptions,
    onProgress?: (status: string) => void,
    maxWaitTime: number = 60000, // 60 seconds max
  ): Promise<ImageGenerationResult> {
    // Step 1: Submit generation task
    onProgress?.("Submitting generation request...");
    const submitResult = await this.generateImage(options);

    if (!submitResult.success || !submitResult.taskId) {
      return submitResult;
    }

    // Step 2: Poll for completion
    const taskId = submitResult.taskId;
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      onProgress?.("Generating image...");

      const taskStatus = await this.checkTaskStatus(taskId);

      if (taskStatus.status === "succeeded" && taskStatus.imageUrl) {
        onProgress?.("Image generated successfully!");
        return {
          success: true,
          imageUrl: taskStatus.imageUrl,
          taskId,
        };
      }

      if (taskStatus.status === "failed") {
        return {
          success: false,
          error: taskStatus.error || "Generation failed",
          taskId,
        };
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Timeout
    return {
      success: false,
      error: "Generation timeout. Please try again.",
      taskId,
    };
  }

  /**
   * Download image from URL and convert to base64
   */
  async downloadImageAsBase64(imageUrl: string): Promise<string | null> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to download image:", error);
      return null;
    }
  }
}

export const aiImageGen = new AIImageGeneration();
