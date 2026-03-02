import { lintMarkdown } from '@/lib/markdown-utils'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

interface LintPanelProps {
  markdown: string
}

export default function LintPanel({ markdown }: LintPanelProps) {
  const issues = lintMarkdown(markdown)
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-sm mb-3">Markdown Linter</h3>
      
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">No issues found!</span>
        </div>
      ) : (
        <>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>{errors.length} errors</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>{warnings.length} warnings</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-sm ${
                  issue.severity === 'error'
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {issue.severity === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">Line {issue.line}</div>
                    <div className="text-muted-foreground">{issue.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
