import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fileOps, type Project } from '@/lib/file-operations'
import { Save, FolderOpen, Trash2, Download, Upload, Clock } from 'lucide-react'

interface ProjectManagerProps {
  currentContent: string
  currentTheme: string
  onLoadProject: (project: Project) => void
}

export default function ProjectManager({ currentContent, currentTheme, onLoadProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState('Untitled')
  const [showVersions, setShowVersions] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    setProjects(fileOps.getAllProjects())
  }

  const handleSave = () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    const project = fileOps.saveProject({
      name: projectName,
      content: currentContent,
      theme: currentTheme
    })

    fileOps.setCurrentProject(project.id)
    loadProjects()
    alert('Project saved!')
  }

  const handleLoad = (project: Project) => {
    if (confirm(`Load "${project.name}"? Current work will be replaced.`)) {
      onLoadProject(project)
      setProjectName(project.name)
      fileOps.setCurrentProject(project.id)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      fileOps.deleteProject(id)
      loadProjects()
    }
  }

  const handleExport = (project: Project) => {
    fileOps.exportProject(project)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const project = await fileOps.importProject(file)
      if (project) {
        loadProjects()
        alert('Project imported successfully!')
      } else {
        alert('Failed to import project')
      }
    }
  }

  const handleShowVersions = (projectId: string) => {
    setShowVersions(showVersions === projectId ? null : projectId)
  }

  const handleRestoreVersion = (versionId: string, projectId: string) => {
    const content = fileOps.restoreVersion(versionId, projectId)
    if (content) {
      const project = fileOps.loadProject(projectId)
      if (project) {
        onLoadProject({ ...project, content })
        alert('Version restored!')
      }
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">Project Management</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md"
              placeholder="Enter project name"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
            
            <input
              type="file"
              accept=".json,.markpolish.json"
              onChange={handleImport}
              className="hidden"
              id="import-project"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-project')?.click()}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="font-semibold text-xs mb-3">Saved Projects</h4>
        
        {projects.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No saved projects yet
          </p>
        ) : (
          <div className="space-y-2.5">
            {projects.map(project => (
              <div key={project.id} className="border rounded-lg p-3 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" title={project.name}>{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.updatedAt.toLocaleDateString()} at {project.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoad(project)}
                    className="flex-1 h-8"
                  >
                    <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                    Load
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShowVersions(project.id)}
                    className="h-8 px-2.5"
                    title="Version History"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(project)}
                    className="h-8 px-2.5"
                    title="Export Project"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(project.id, project.name)}
                    className="h-8 px-2.5"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {showVersions === project.id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium mb-2">Version History</div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {fileOps.getProjectVersions(project.id).reverse().map(version => (
                        <div
                          key={version.id}
                          className="flex items-center justify-between p-2 bg-muted rounded text-xs hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{version.description}</div>
                            <div className="text-muted-foreground text-[10px]">
                              {version.timestamp.toLocaleString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRestoreVersion(version.id, project.id)}
                            className="h-7 text-xs ml-2"
                          >
                            Restore
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
