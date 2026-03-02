import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getDocumentStats, analyzeReadability, checkGrammarAndStyle, type DocumentStats, type StyleIssue } from '@/lib/polish-engine'
import { BarChart3, Clock, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface StatsPanelProps {
  markdown: string
}

export default function StatsPanel({ markdown }: StatsPanelProps) {
  const [showStyleIssues, setShowStyleIssues] = useState(false)
  const [styleIssues, setStyleIssues] = useState<StyleIssue[]>([])
  
  const stats = getDocumentStats(markdown)
  const readability = analyzeReadability(markdown)

  const handleCheckStyle = () => {
    const issues = checkGrammarAndStyle(markdown)
    setStyleIssues(issues)
    setShowStyleIssues(true)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Document Statistics
        </h3>
        
        <div className="space-y-3">
          {/* Basic Stats */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Characters:</span>
              <span className="font-mono">{stats.characters.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Characters (no spaces):</span>
              <span className="font-mono">{stats.charactersNoSpaces.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Words:</span>
              <span className="font-mono font-semibold">{stats.words.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sentences:</span>
              <span className="font-mono">{stats.sentences.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paragraphs:</span>
              <span className="font-mono">{stats.paragraphs.toLocaleString()}</span>
            </div>
          </div>

          {/* Time Estimates */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              <Clock className="w-4 h-4" />
              Time Estimates
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reading time:</span>
              <span className="font-mono">{stats.readingTime} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Speaking time:</span>
              <span className="font-mono">{stats.speakingTime} min</span>
            </div>
          </div>

          {/* Content Elements */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              Content Elements
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">H1:</span>
                <span className="font-mono">{stats.headings.h1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H2:</span>
                <span className="font-mono">{stats.headings.h2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H3:</span>
                <span className="font-mono">{stats.headings.h3}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H4:</span>
                <span className="font-mono">{stats.headings.h4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lists:</span>
                <span className="font-mono">{stats.lists}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code:</span>
                <span className="font-mono">{stats.codeBlocks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Links:</span>
                <span className="font-mono">{stats.links}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images:</span>
                <span className="font-mono">{stats.images}</span>
              </div>
            </div>
          </div>

          {/* Readability */}
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              Readability Score
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Flesch Score:</span>
              <span className="font-mono font-semibold">{readability.fleschScore.toFixed(1)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {readability.interpretation}
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Grade Level:</span>
              <span className="font-mono">{readability.gradeLevel.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg words/sentence:</span>
              <span className="font-mono">{readability.avgWordsPerSentence.toFixed(1)}</span>
            </div>
          </div>

          {/* Style Check */}
          <div className="border-t border-border pt-3">
            <Button
              onClick={handleCheckStyle}
              className="w-full"
              variant="outline"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Check Grammar & Style
            </Button>
          </div>

          {/* Style Issues */}
          {showStyleIssues && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  Style Issues ({styleIssues.length})
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStyleIssues(false)}
                >
                  Close
                </Button>
              </div>
              
              {styleIssues.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  No issues found! Great writing!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {styleIssues.map((issue, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2 rounded border ${
                        issue.severity === 'error'
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                          : issue.severity === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {issue.severity === 'error' ? (
                          <AlertCircle className="w-3 h-3 mt-0.5 text-red-600" />
                        ) : issue.severity === 'warning' ? (
                          <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-600" />
                        ) : (
                          <Info className="w-3 h-3 mt-0.5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">Line {issue.line}: {issue.issue}</div>
                          <div className="text-muted-foreground mt-1">"{issue.text}"</div>
                          <div className="text-muted-foreground mt-1 italic">{issue.suggestion}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Engagement Metrics */}
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
              Engagement Prediction
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Optimal length:</span>
                <span className={stats.words >= 300 && stats.words <= 1500 ? 'text-green-600' : 'text-yellow-600'}>
                  {stats.words >= 300 && stats.words <= 1500 ? '✓ Good' : '⚠ Too ' + (stats.words < 300 ? 'short' : 'long')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Readability:</span>
                <span className={readability.fleschScore >= 60 ? 'text-green-600' : 'text-yellow-600'}>
                  {readability.fleschScore >= 60 ? '✓ Good' : '⚠ Difficult'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visual content:</span>
                <span className={stats.images >= 1 ? 'text-green-600' : 'text-yellow-600'}>
                  {stats.images >= 1 ? '✓ Has images' : '⚠ Add images'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Structure:</span>
                <span className={stats.headings.h2 >= 2 ? 'text-green-600' : 'text-yellow-600'}>
                  {stats.headings.h2 >= 2 ? '✓ Well structured' : '⚠ Add sections'}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-800">
              <div className="text-xs text-muted-foreground">
                Estimated engagement: {calculateEngagement(stats, readability)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateEngagement(stats: DocumentStats, readability: any): string {
  let score = 0
  
  // Length score (300-1500 words is optimal)
  if (stats.words >= 300 && stats.words <= 1500) score += 25
  else if (stats.words >= 200 && stats.words <= 2000) score += 15
  else score += 5
  
  // Readability score (60-80 is optimal)
  if (readability.fleschScore >= 60 && readability.fleschScore <= 80) score += 25
  else if (readability.fleschScore >= 50 && readability.fleschScore <= 90) score += 15
  else score += 5
  
  // Visual content
  if (stats.images >= 2) score += 20
  else if (stats.images >= 1) score += 10
  
  // Structure
  if (stats.headings.h2 >= 3) score += 20
  else if (stats.headings.h2 >= 2) score += 10
  
  // Reading time (3-7 minutes is optimal)
  if (stats.readingTime >= 3 && stats.readingTime <= 7) score += 10
  else if (stats.readingTime >= 2 && stats.readingTime <= 10) score += 5
  
  if (score >= 80) return '🔥 High (80%+)'
  if (score >= 60) return '✨ Good (60-80%)'
  if (score >= 40) return '👍 Fair (40-60%)'
  return '📈 Needs improvement (<40%)'
}
