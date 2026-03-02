import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code,
  Quote
} from 'lucide-react'

interface ToolbarProps {
  markdown: string
  setMarkdown: (markdown: string) => void
}

export default function Toolbar({ markdown, setMarkdown }: ToolbarProps) {
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    setMarkdown(markdown + before + placeholder + after)
  }

  return (
    <div className="border-b border-border p-2 flex gap-1 flex-wrap">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('**', '**', 'bold text')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('*', '*', 'italic text')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('\n# ', '', 'Heading 1')}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('\n## ', '', 'Heading 2')}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('\n- ', '', 'List item')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('\n1. ', '', 'List item')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('[', '](url)', 'link text')}
        title="Link"
      >
        <Link className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('![', '](image-url)', 'alt text')}
        title="Image"
      >
        <Image className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('\n```\n', '\n```\n', 'code')}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertText('\n> ', '', 'quote')}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </Button>
    </div>
  )
}
