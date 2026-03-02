// Keyboard shortcuts system

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

export class KeyboardShortcuts {
  private shortcuts: Map<string, Shortcut> = new Map()
  private enabled: boolean = true

  constructor() {
    this.setupListener()
  }

  register(id: string, shortcut: Shortcut): void {
    this.shortcuts.set(id, shortcut)
  }

  unregister(id: string): void {
    this.shortcuts.delete(id)
  }

  enable(): void {
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }

  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }

  private setupListener(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return

      // Don't trigger shortcuts when typing in input/textarea (except for specific ones)
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      for (const shortcut of this.shortcuts.values()) {
        if (this.matchesShortcut(e, shortcut)) {
          // Allow Ctrl+S, Ctrl+B, etc. even in inputs
          const allowInInput = shortcut.ctrl || shortcut.meta
          
          if (!isInput || allowInInput) {
            e.preventDefault()
            shortcut.action()
            break
          }
        }
      }
    })
  }

  private matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
    const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
    const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
    const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
    const altMatch = shortcut.alt ? e.altKey : !e.altKey

    return keyMatch && ctrlMatch && shiftMatch && altMatch
  }

  getShortcutString(shortcut: Shortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrl || shortcut.meta) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    }
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join('+')
  }
}

export const shortcuts = new KeyboardShortcuts()

// Default shortcuts
export function setupDefaultShortcuts(actions: {
  save: () => void
  bold: () => void
  italic: () => void
  undo: () => void
  redo: () => void
  find: () => void
  newProject: () => void
  togglePreview: () => void
  toggleTheme: () => void
}): void {
  shortcuts.register('save', {
    key: 's',
    ctrl: true,
    description: 'Save project',
    action: actions.save
  })

  shortcuts.register('bold', {
    key: 'b',
    ctrl: true,
    description: 'Bold text',
    action: actions.bold
  })

  shortcuts.register('italic', {
    key: 'i',
    ctrl: true,
    description: 'Italic text',
    action: actions.italic
  })

  shortcuts.register('undo', {
    key: 'z',
    ctrl: true,
    description: 'Undo',
    action: actions.undo
  })

  shortcuts.register('redo', {
    key: 'z',
    ctrl: true,
    shift: true,
    description: 'Redo',
    action: actions.redo
  })

  shortcuts.register('find', {
    key: 'f',
    ctrl: true,
    description: 'Find in document',
    action: actions.find
  })

  shortcuts.register('new', {
    key: 'n',
    ctrl: true,
    description: 'New project',
    action: actions.newProject
  })

  shortcuts.register('preview', {
    key: 'p',
    ctrl: true,
    shift: true,
    description: 'Toggle preview',
    action: actions.togglePreview
  })

  shortcuts.register('theme', {
    key: 'd',
    ctrl: true,
    shift: true,
    description: 'Toggle dark mode',
    action: actions.toggleTheme
  })
}
