'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Unlink,
    Code,
    Minus,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Heading1,
    Heading2,
    Heading3,
    Type,
} from 'lucide-react';

interface BlogRichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onImageUpload?: (file: File) => Promise<string>;
}

const TEXT_COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#10B981' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
];

const HIGHLIGHT_COLORS = [
    { name: 'None', value: '' },
    { name: 'Yellow', value: '#FEF08A' },
    { name: 'Green', value: '#BBF7D0' },
    { name: 'Blue', value: '#BFDBFE' },
    { name: 'Pink', value: '#FBCFE8' },
    { name: 'Purple', value: '#DDD6FE' },
];

export function BlogRichTextEditor({
    content,
    onChange,
    placeholder = 'Write your blog post here...',
    onImageUpload,
}: BlogRichTextEditorProps) {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-violet-600 underline hover:text-violet-800',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 text-gray-900',
            },
        },
    });

    const addLink = useCallback(() => {
        if (!linkUrl || !editor) return;

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: linkUrl })
            .run();

        setLinkUrl('');
        setShowLinkDialog(false);
    }, [editor, linkUrl]);

    const removeLink = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetLink().run();
    }, [editor]);

    const handleImageUpload = useCallback(async () => {
        if (!onImageUpload) {
            const url = window.prompt('Enter image URL:');
            if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run();
            }
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file && editor) {
                try {
                    setIsUploadingImage(true);
                    const url = await onImageUpload(file);
                    editor.chain().focus().setImage({ src: url }).run();
                } catch (error) {
                    alert('Failed to upload image');
                    console.error(error);
                } finally {
                    setIsUploadingImage(false);
                }
            }
        };
        input.click();
    }, [editor, onImageUpload]);

    if (!editor) return null;

    return (
        <div className="border rounded-xl overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="border-b p-2 flex flex-wrap items-center gap-1 bg-gray-50">
                {/* History */}
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 text-gray-700"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 text-gray-700"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Headings Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                        className="p-2 rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1"
                        title="Headings"
                    >
                        <Type className="w-4 h-4" />
                        <span className="text-xs">▼</span>
                    </button>
                    {showHeadingMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                            <button
                                onClick={() => {
                                    editor.chain().focus().setParagraph().run();
                                    setShowHeadingMenu(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                            >
                                Paragraph
                            </button>
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => {
                                        editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                                        setShowHeadingMenu(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${editor.isActive('heading', { level }) ? 'bg-violet-50 text-violet-700' : ''
                                        }`}
                                    style={{ fontSize: `${24 - level * 2}px`, fontWeight: 'bold' }}
                                >
                                    Heading {level}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text Formatting */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Underline"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text Color */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 rounded hover:bg-gray-200 text-gray-700"
                        title="Text Color"
                    >
                        <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-2">
                            <div className="grid grid-cols-4 gap-1">
                                {TEXT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => {
                                            editor.chain().focus().setColor(color.value).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Highlight Color */}
                <div className="relative">
                    <button
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                        title="Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </button>
                    {showHighlightPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-2">
                            <div className="grid grid-cols-3 gap-1">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => {
                                            if (color.value) {
                                                editor.chain().focus().setHighlight({ color: color.value }).run();
                                            } else {
                                                editor.chain().focus().unsetHighlight().run();
                                            }
                                            setShowHighlightPicker(false);
                                        }}
                                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                                        style={{ backgroundColor: color.value || '#ffffff' }}
                                        title={color.name}
                                    >
                                        {!color.value && <span className="text-xs">✕</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Alignment */}
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Justify"
                >
                    <AlignJustify className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* More Formatting */}
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Code Block"
                >
                    <Code className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-2 rounded hover:bg-gray-200 text-gray-700"
                    title="Horizontal Rule"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Link & Image */}
                <div className="relative">
                    <button
                        onClick={() => setShowLinkDialog(!showLinkDialog)}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                        title="Add Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    {showLinkDialog && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-50 flex gap-2">
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://..."
                                className="px-2 py-1 border rounded text-sm w-48"
                                autoFocus
                            />
                            <Button size="sm" onClick={addLink}>Add</Button>
                        </div>
                    )}
                </div>
                {editor.isActive('link') && (
                    <button
                        onClick={removeLink}
                        className="p-2 rounded hover:bg-gray-200 text-red-600"
                        title="Remove Link"
                    >
                        <Unlink className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={handleImageUpload}
                    disabled={isUploadingImage}
                    className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                    title="Add Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
