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
          class: 'bg-gray-100 p-4 rounded-md text-sm'
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
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex items-center space-x-1 flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bold')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Bold"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('italic')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Italic"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('link')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Bullet List"
        >
          <ListIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Numbered List"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('code')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Inline Code"
        >
          <CodeIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('blockquote')
              ? 'bg-gray-200 text-orange-600'
              : 'text-gray-600'
          }`}
          title="Quote"
        >
          <QuoteIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <UndoIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <RedoIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="text-gray-800 min-h-[200px]"
        />

        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
