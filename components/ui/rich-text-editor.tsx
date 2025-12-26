"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Heading2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

// 툴바 버튼 컴포넌트
const ToolbarButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant={active ? "default" : "ghost"}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn("h-8 w-8 p-0", active && "bg-accent")}
  >
    {children}
  </Button>
);

// 에디터 툴바
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = prompt("이미지 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutubeVideo = () => {
    const url = prompt("YouTube URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt("링크 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 border-b bg-muted/30 p-2">
      {/* 텍스트 스타일 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="굵게 (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="기울임 (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="제목"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-8 w-px bg-border" />

      {/* 리스트 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="목록"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="번호 목록"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-8 w-px bg-border" />

      {/* 미디어 */}
      <ToolbarButton onClick={addLink} title="링크 추가">
        <Link2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton onClick={addImage} title="이미지 추가">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton onClick={addYoutubeVideo} title="YouTube 영상 추가">
        <YoutubeIcon className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-8 w-px bg-border" />

      {/* 되돌리기 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="되돌리기 (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="다시 실행 (Ctrl+Shift+Z)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "내용을 입력하세요...",
  editable = true,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // SSR hydration mismatch 방지
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "mx-auto my-4 rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
          !editable && "cursor-default"
        ),
      },
    },
  });

  // content prop이 변경되면 에디터 업데이트
  if (editor && content !== editor.getHTML() && !editor.isFocused) {
    editor.commands.setContent(content);
  }

  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// 읽기 전용 뷰어 컴포넌트
export function RichTextViewer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <RichTextEditor
      content={content}
      editable={false}
      className={cn("border-none", className)}
    />
  );
}

