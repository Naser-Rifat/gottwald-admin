import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Link2, List, ListOrdered, Heading3, Heading2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ToolbarButton = ({ 
  isActive, 
  onClick, 
  children, 
  ariaLabel 
}: { 
  isActive: boolean; 
  onClick: () => void; 
  children: React.ReactNode; 
  ariaLabel: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-1.5 rounded-sm transition-colors ${
      isActive 
        ? "bg-zinc-800 text-zinc-100" 
        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-gottwald-gold underline underline-offset-4",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-invert prose-zinc max-w-none prose-p:my-2 prose-headings:my-4 prose-h3:text-lg prose-h2:text-xl",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    
    // cancelled
    if (url === null) return;
    
    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 p-1">
        <ToolbarButton
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          ariaLabel="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          ariaLabel="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <div className="mx-1 h-6 w-px bg-zinc-800" />
        
        <ToolbarButton
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          ariaLabel="Toggle heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          ariaLabel="Toggle heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        
        <div className="mx-1 h-6 w-px bg-zinc-800" />

        <ToolbarButton
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          ariaLabel="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          ariaLabel="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-zinc-800" />

        <ToolbarButton
          isActive={editor.isActive("link")}
          onClick={setLink}
          ariaLabel="Toggle link"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      
      <EditorContent editor={editor} />
    </div>
  );
}
