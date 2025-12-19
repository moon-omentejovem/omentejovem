'use client'

import { createClient } from '@/utils/supabase/client'
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
import { useState } from 'react'

import { JSONContent } from '@tiptap/react'

interface TiptapEditorProps {
  content: JSONContent
  onChange: (content: JSONContent) => void
  placeholder?: string
  className?: string
  editorSlug: string
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  editorSlug
}: TiptapEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            'data-preview-image': {
              default: null,
              parseHTML: (element) =>
                element.getAttribute('data-preview-image'),
              renderHTML: (attributes) => {
                if (!attributes['data-preview-image']) {
                  return {}
                }
                return {
                  'data-preview-image': attributes['data-preview-image']
                }
              }
            }
          }
        }
      }).configure({
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
        className: `prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 ${className}`
      }
    }
  })

  const urlInputId = `${editorSlug}-link-url`
  const previewInputId = `${editorSlug}-preview-url`

  const openLinkModal = () => {
    if (!editor) return
    setLinkUrl('')
    setPreviewUrl('')
    setShowLinkModal(true)
  }

  const confirmLink = () => {
    if (!editor || !linkUrl.trim()) {
      setShowLinkModal(false)
      return
    }

    const hasPreview = previewUrl.trim().length > 0

    ;(editor.chain().focus().extendMarkRange('link') as any)
      .setLink(
        hasPreview
          ? {
              href: linkUrl.trim(),
              'data-preview-image': previewUrl.trim()
            }
          : {
              href: linkUrl.trim()
            }
      )
      .run()

    setShowLinkModal(false)
  }

  // Novo fluxo: upload real de imagem para Supabase Storage
  const supabase = createClient()
  const addImage = async () => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      // Gera id único para imagem
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15)
      const ext = file.name.split('.').pop()
      const filename = `${id}.${ext}`
      const path = `images/${filename}`
      try {
        const { error } = await supabase.storage
          .from('media')
          .upload(path, file, { upsert: true })
        if (error) throw error
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const imageurl = `${baseUrl}/storage/v1/object/public/media/images/${filename}`
        editor.chain().focus().setImage({ src: imageurl }).run()
      } catch (err) {
        alert('Erro ao enviar imagem.')
      }
    }
    input.click()
  }

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden overflow-y-auto max-h-[500px]">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex items-center space-x-1 flex-wrap gap-1 sticky top-0 bg-white z-10">
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
          onClick={openLinkModal}
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

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Add link with preview
            </h2>

            <div className="space-y-2">
              <label
                htmlFor={urlInputId}
                className="block text-sm font-medium text-gray-700"
              >
                URL
              </label>
              <input
                id={urlInputId}
                type="text"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={previewInputId}
                className="block text-sm font-medium text-gray-700"
              >
                Preview image URL (optional)
              </label>
              <input
                id={previewInputId}
                type="text"
                value={previewUrl}
                onChange={(event) => setPreviewUrl(event.target.value)}
                placeholder="https://.../image.jpg"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLink}
                className="px-4 py-2 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                Add link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
