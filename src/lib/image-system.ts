// Advanced image system for WeChat content

export type ImageSource = 'ai-dashscope' | 'ai-modelscope' | 'picsum' | 'placeholder' | 'gradient' | 'pattern'
export type AspectRatio = '1:1' | '16:9' | '9:16'

export interface ImageConfig {
  source: ImageSource
  aspectRatio: AspectRatio
  apiKey?: string
}

export const gradientStyles = {
  blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  aurora: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  fire: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  midnight: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)'
}

export const patternStyles = {
  dots: `data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23000' opacity='0.1'/%3E%3C/svg%3E`,
  lines: `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0' stroke='%23000' stroke-width='1' opacity='0.1'/%3E%3C/svg%3E`
}

export function getAspectRatioDimensions(ratio: AspectRatio, baseWidth: number = 800): { width: number; height: number } {
  switch (ratio) {
    case '1:1':
      return { width: baseWidth, height: baseWidth }
    case '16:9':
      return { width: baseWidth, height: Math.round(baseWidth * 9 / 16) }
    case '9:16':
      return { width: baseWidth, height: Math.round(baseWidth * 16 / 9) }
  }
}

export function generatePicsumUrl(config: ImageConfig): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio)
  return `https://picsum.photos/${width}/${height}?random=${Date.now()}`
}

export function generatePlaceholderUrl(config: ImageConfig, text: string = 'Image'): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio)
  return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`
}

export function generateGradientStyle(gradientType: keyof typeof gradientStyles, config: ImageConfig): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio)
  const gradient = gradientStyles[gradientType]
  
  return `background: ${gradient}; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;`
}

export function generatePatternStyle(patternType: keyof typeof patternStyles, config: ImageConfig): string {
  const { width, height } = getAspectRatioDimensions(config.aspectRatio)
  const pattern = patternStyles[patternType]
  
  return `background: #f0f0f0 url("${pattern}") repeat; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 24px; font-weight: bold;`
}

// AI Image Generation (placeholder - implement with actual APIs)
export async function generateAIImage(description: string, config: ImageConfig): Promise<string> {
  // This would call DashScope or ModelScope APIs
  // For now, return a placeholder
  // For now, return a placeholder
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Return placeholder for now
  return generatePlaceholderUrl(config, `AI: ${description.substring(0, 20)}`)
}

export interface ImageLibraryItem {
  id: string
  filename: string
  url: string
  description: string
  addedAt: Date
  tags: string[]
}

export class ImageLibrary {
  private items: ImageLibraryItem[] = []
  
  constructor() {
    this.loadFromStorage()
  }
  
  add(item: Omit<ImageLibraryItem, 'id' | 'addedAt'>): ImageLibraryItem {
    const newItem: ImageLibraryItem = {
      ...item,
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date()
    }
    
    this.items.push(newItem)
    this.saveToStorage()
    return newItem
  }
  
  remove(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id)
    if (index !== -1) {
      this.items.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }
  
  get(id: string): ImageLibraryItem | undefined {
    return this.items.find(item => item.id === id)
  }
  
  getAll(): ImageLibraryItem[] {
    return [...this.items]
  }
  
  search(query: string): ImageLibraryItem[] {
    const lowerQuery = query.toLowerCase()
    return this.items.filter(item =>
      item.filename.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('markpolish_image_library')
      if (stored) {
        this.items = JSON.parse(stored).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load image library:', error)
    }
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('markpolish_image_library', JSON.stringify(this.items))
    } catch (error) {
      console.error('Failed to save image library:', error)
    }
  }
}

export const imageLibrary = new ImageLibrary()
