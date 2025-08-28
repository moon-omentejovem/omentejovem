'use client'

import CodeBlock from '@tiptap/extension-code-block'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  BoldIcon,
  CodeIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  RedoIcon,
  UndoIcon
} from 'lucide-react'

import { JSONContent } from '@tiptap/react'

interface TiptapEditorProps {
  content: JSONContent
  onChange: (content: JSONContent) => void
  placeholder?: string
  className?: string
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = ''
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-400 underline hover:text-orange-300'
        }
      }),
      Image,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-neutral-800 p-4 rounded-md text-sm'
        }
      })
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 ${className}`
      }
    }
  })

  const addLink = () => {
    if (!editor) return

    const url = window.prompt('Enter URL:')
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run()
    }
  }

  const addImage = () => {
    if (!editor) return

    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  if (!editor) return null

  return (
    <div className="border border-neutral-700 rounded-lg bg-neutral-900 overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-neutral-700 p-2 flex items-center space-x-1 flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('bold')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Bold"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('italic')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Italic"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('link')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-neutral-700 text-neutral-400"
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('bulletList')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Bullet List"
        >
          <ListIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('orderedList')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Numbered List"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('code')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Inline Code"
        >
          <CodeIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-neutral-700 ${
            editor.isActive('blockquote')
              ? 'bg-neutral-700 text-orange-400'
              : 'text-neutral-400'
          }`}
          title="Quote"
        >
          <QuoteIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-neutral-700 text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <UndoIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-neutral-700 text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <RedoIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="text-neutral-200 min-h-[200px]"
        />

        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-neutral-500 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
