'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Unlink,
    AlertCircle,
} from 'lucide-react';

interface RichTextEditorProps {
    title: string;
    onTitleChange: (title: string) => void;
    content: string;
    onChange: (content: string) => void;
    maxLinks: number;
    linkType: 'dofollow' | 'nofollow';
    placeholder?: string;
}

export function RichTextEditor({
    title,
    onTitleChange,
    content,
    onChange,
    maxLinks,
    linkType,
    placeholder = 'Write your article here...',
}: RichTextEditorProps) {
    const [linkCount, setLinkCount] = useState(0);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: linkType === 'nofollow' ? 'nofollow noopener' : 'dofollow',
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
            // Count links
            const links = editor.getHTML().match(/<a\s/g) || [];
            setLinkCount(links.length);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 text-gray-900',
            },
        },
    });

    const isOverLimit = linkCount > maxLinks;

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

    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="border rounded-xl overflow-hidden bg-white">
            {/* Title Input */}
            <div className="border-b p-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter article title..."
                    className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
            </div>

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

                {/* Headings */}
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </button>

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
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
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
                    onClick={addImage}
                    className="p-2 rounded hover:bg-gray-200 text-gray-700"
                    title="Add Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>

                {/* Link Counter */}
                <div className="flex-1" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOverLimit
                    ? 'bg-red-100 text-red-700'
                    : linkCount > 0
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    <LinkIcon className="w-3 h-3" />
                    <span>{linkCount}/{maxLinks} {linkType} links</span>
                </div>
            </div>

            {/* Link Limit Warning */}
            {isOverLimit && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Too many links ({linkCount}/{maxLinks})</p>
                        <p className="text-red-600 text-sm">
                            Please remove {linkCount - maxLinks} link{linkCount - maxLinks > 1 ? 's' : ''} to make your article publishable.
                            Select a link and click the unlink button above.
                        </p>
                    </div>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
