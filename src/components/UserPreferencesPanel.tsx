import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Settings, Save, RotateCcw } from 'lucide-react'

interface UserSettings {
  autoSave: boolean
  autoSaveInterval: number
  defaultTheme: string
  editorFontSize: number
  editorLineHeight: number
  showLineNumbers: boolean
  wordWrap: boolean
  spellCheck: boolean
  darkMode: boolean
  exportFormat: 'markdown' | 'html' | 'wechat'
}

const defaultSettings: UserSettings = {
  autoSave: true,
  autoSaveInterval: 30,
  defaultTheme: 'wechat-classic',
  editorFontSize: 14,
  editorLineHeight: 1.6,
  showLineNumbers: false,
  wordWrap: true,
  spellCheck: true,
  darkMode: false,
  exportFormat: 'wechat'
}

export default function UserPreferencesPanel() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('markpolish_settings')
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('markpolish_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    // Apply settings immediately
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      setSettings(defaultSettings)
      localStorage.removeItem('markpolish_settings')
    }
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          User Preferences
        </h3>

        <div className="space-y-4">
          {/* Auto-save Settings */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="text-sm font-medium">Auto-save</div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enable auto-save</span>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            {settings.autoSave && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Interval (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={settings.autoSaveInterval}
                  onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
            )}
          </div>

          {/* Editor Settings */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="text-sm font-medium">Editor</div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Font size (px)
              </label>
              <input
                type="number"
                min="10"
                max="24"
                value={settings.editorFontSize}
                onChange={(e) => updateSetting('editorFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Line height
              </label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={settings.editorLineHeight}
                onChange={(e) => updateSetting('editorLineHeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Show line numbers</span>
              <Switch
                checked={settings.showLineNumbers}
                onCheckedChange={(checked) => updateSetting('showLineNumbers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Word wrap</span>
              <Switch
                checked={settings.wordWrap}
                onCheckedChange={(checked) => updateSetting('wordWrap', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Spell check</span>
              <Switch
                checked={settings.spellCheck}
                onCheckedChange={(checked) => updateSetting('spellCheck', checked)}
              />
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="text-sm font-medium">Appearance</div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dark mode</span>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Default theme
              </label>
              <select
                value={settings.defaultTheme}
                onChange={(e) => updateSetting('defaultTheme', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md"
              >
                <option value="wechat-classic">WeChat Classic</option>
                <option value="tech-blue">Tech Blue</option>
                <option value="elegant-purple">Elegant Purple</option>
                <option value="fresh-green">Fresh Green</option>
                <option value="warm-orange">Warm Orange</option>
              </select>
            </div>
          </div>

          {/* Export Settings */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="text-sm font-medium">Export</div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Default export format
              </label>
              <select
                value={settings.exportFormat}
                onChange={(e) => updateSetting('exportFormat', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border rounded-md"
              >
                <option value="markdown">Markdown (.md)</option>
                <option value="html">HTML (.html)</option>
                <option value="wechat">WeChat (clipboard)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved!' : 'Save Settings'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
            <p className="font-medium mb-1">💡 Pro Tip</p>
            <p>Settings are saved locally in your browser. Clear browser data will reset settings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
