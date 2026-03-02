// File operations: save, load, auto-save, version history

export interface Project {
  id: string
  name: string
  content: string
  theme: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectVersion {
  id: string
  projectId: string
  content: string
  timestamp: Date
  description: string
}

class FileOperations {
  private readonly STORAGE_KEY = 'markpolish_projects'
  private readonly VERSIONS_KEY = 'markpolish_versions'
  private readonly CURRENT_PROJECT_KEY = 'markpolish_current_project'
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null

  // Project Management
  saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getAllProjects()
    const existingProject = projects.find(p => p.name === project.name)

    if (existingProject) {
      // Update existing
      existingProject.content = project.content
      existingProject.theme = project.theme
      existingProject.updatedAt = new Date()
      this.saveAllProjects(projects)
      this.saveVersion(existingProject.id, project.content, 'Manual save')
      return existingProject
    } else {
      // Create new
      const newProject: Project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: project.name,
        content: project.content,
        theme: project.theme,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      projects.push(newProject)
      this.saveAllProjects(projects)
      this.saveVersion(newProject.id, project.content, 'Project created')
      return newProject
    }
  }

  loadProject(id: string): Project | null {
    const projects = this.getAllProjects()
    return projects.find(p => p.id === id) || null
  }

  deleteProject(id: string): boolean {
    const projects = this.getAllProjects()
    const index = projects.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.splice(index, 1)
      this.saveAllProjects(projects)
      // Also delete versions
      this.deleteProjectVersions(id)
      return true
    }
    return false
  }

  getAllProjects(): Project[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
    return []
  }

  private saveAllProjects(projects: Project[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects))
    } catch (error) {
      console.error('Failed to save projects:', error)
    }
  }

  // Current Project
  setCurrentProject(projectId: string): void {
    localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId)
  }

  getCurrentProjectId(): string | null {
    return localStorage.getItem(this.CURRENT_PROJECT_KEY)
  }

  // Version History
  saveVersion(projectId: string, content: string, description: string): ProjectVersion {
    const versions = this.getProjectVersions(projectId)
    const newVersion: ProjectVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      content,
      timestamp: new Date(),
      description
    }
    
    versions.push(newVersion)
    
    // Keep only last 20 versions
    if (versions.length > 20) {
      versions.shift()
    }
    
    this.saveProjectVersions(projectId, versions)
    return newVersion
  }

  getProjectVersions(projectId: string): ProjectVersion[] {
    try {
      const stored = localStorage.getItem(`${this.VERSIONS_KEY}_${projectId}`)
      if (stored) {
        return JSON.parse(stored).map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
    }
    return []
  }

  private saveProjectVersions(projectId: string, versions: ProjectVersion[]): void {
    try {
      localStorage.setItem(`${this.VERSIONS_KEY}_${projectId}`, JSON.stringify(versions))
    } catch (error) {
      console.error('Failed to save versions:', error)
    }
  }

  private deleteProjectVersions(projectId: string): void {
    localStorage.removeItem(`${this.VERSIONS_KEY}_${projectId}`)
  }

  restoreVersion(versionId: string, projectId: string): string | null {
    const versions = this.getProjectVersions(projectId)
    const version = versions.find(v => v.id === versionId)
    return version ? version.content : null
  }

  // Auto-save
  startAutoSave(
    getCurrentContent: () => string,
    getCurrentTheme: () => string,
    projectName: string,
    intervalMs: number = 30000 // 30 seconds
  ): void {
    this.stopAutoSave()
    
    this.autoSaveInterval = setInterval(() => {
      const content = getCurrentContent()
      const theme = getCurrentTheme()
      
      if (content.trim()) {
        this.saveProject({
          name: projectName || 'Untitled',
          content,
          theme
        })
        console.log('Auto-saved at', new Date().toLocaleTimeString())
      }
    }, intervalMs)
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  // Export/Import
  exportProject(project: Project): void {
    const dataStr = JSON.stringify(project, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name}.markpolish.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async importProject(file: File): Promise<Project | null> {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validate structure
      if (data.name && data.content) {
        return this.saveProject({
          name: data.name + ' (imported)',
          content: data.content,
          theme: data.theme || 'wechat-classic'
        })
      }
    } catch (error) {
      console.error('Failed to import project:', error)
    }
    return null
  }
}

export const fileOps = new FileOperations()
