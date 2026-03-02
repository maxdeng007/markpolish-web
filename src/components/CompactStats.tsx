import { useState } from 'react'
import { ChevronUp, ChevronDown, BarChart3, Clock, FileText } from 'lucide-react'
import { getDocumentStats, analyzeReadability } from '@/lib/polish-engine'

interface CompactStatsProps {
  markdown: string
}

export default function CompactStats({ markdown }: CompactStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const stats = getDocumentStats(markdown)
  const readability = analyzeReadability(markdown)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      {/* Compact View - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Document Stats</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="font-mono">{stats.words}</span>
              <span>words</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{stats.readingTime}</span>
              <span>min read</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Score:</span>
              <span className="font-mono font-semibold">{readability.fleschScore.toFixed(0)}</span>
            </div>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-border bg-background max-h-[60vh] overflow-y-auto">
          <div className="p-4 grid grid-cols-3 gap-4">
            {/* Basic Stats */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3">Basic Stats</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="font-mono">{stats.characters.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Words:</span>
                  <span className="font-mono font-semibold">{stats.words.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sentences:</span>
                  <span className="font-mono">{stats.sentences.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paragraphs:</span>
                  <span className="font-mono">{stats.paragraphs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Reading time:</span>
                  <span className="font-mono">{stats.readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speaking time:</span>
                  <span className="font-mono">{stats.speakingTime} min</span>
                </div>
              </div>
            </div>

            {/* Content Elements */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3">Content Elements</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
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

            {/* Readability & Quality */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3">Readability & Quality</h4>
              <div className="space-y-2 text-xs">
                <div className="bg-green-50 dark:bg-green-950/30 rounded p-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Flesch Score:</span>
                    <span className="font-mono font-semibold">{readability.fleschScore.toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {readability.interpretation}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade Level:</span>
                    <span className="font-mono">{readability.gradeLevel.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg words/sentence:</span>
                    <span className="font-mono">{readability.avgWordsPerSentence.toFixed(1)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Length:</span>
                    <span className={stats.words >= 300 && stats.words <= 1500 ? 'text-green-600' : 'text-yellow-600'}>
                      {stats.words >= 300 && stats.words <= 1500 ? '✓ Good' : '⚠ ' + (stats.words < 300 ? 'Short' : 'Long')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Readability:</span>
                    <span className={readability.fleschScore >= 60 ? 'text-green-600' : 'text-yellow-600'}>
                      {readability.fleschScore >= 60 ? '✓ Good' : '⚠ Hard'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visual content:</span>
                    <span className={stats.images >= 1 ? 'text-green-600' : 'text-yellow-600'}>
                      {stats.images >= 1 ? '✓ Yes' : '⚠ None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Structure:</span>
                    <span className={stats.headings.h2 >= 2 ? 'text-green-600' : 'text-yellow-600'}>
                      {stats.headings.h2 >= 2 ? '✓ Good' : '⚠ Weak'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
