"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Button } from "@/components/ui/button";
import { FiBold, FiItalic, FiUnderline, FiList } from "react-icons/fi";
import { Chrome } from "@uiw/react-color";

// Extension to keep marks when typing
const KeepMarks = Extension.create({
  name: "keepMarks",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("keepMarks"),
        appendTransaction: (_transactions, _oldState, newState) => {
          // Get stored marks from the state
          const storedMarks = newState.storedMarks;
          if (storedMarks && storedMarks.length > 0) {
            // Marks are already stored, keep them
            return null;
          }
          return null;
        },
      }),
    ];
  },
});

// Extend TextStyle to support fontSize
declare module "@tiptap/extension-text-style" {
  interface TextStyleOptions {
    types: string[];
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeFontSize, setActiveFontSize] = useState("16px");
  const [isBulletListActive, setIsBulletListActive] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  // Process content: if it contains HTML tags, use as-is; otherwise convert plain text line breaks to paragraphs
  const processedValue = value.includes("<")
    ? value
    : value
        .split("\n")
        .map((line) => `<p>${line}</p>`)
        .join("");

  const updateEditorState = (editorInstance: ReturnType<typeof useEditor>) => {
    if (!editorInstance) return;
    const fontSize = editorInstance.getAttributes("textStyle").fontSize;
    setActiveFontSize(fontSize || "16px");

    setIsBulletListActive(editorInstance.isActive("bulletList"));
    setIsBoldActive(editorInstance.isActive("bold"));
    setIsItalicActive(editorInstance.isActive("italic"));
    setIsUnderlineActive(editorInstance.isActive("underline"));
  };

  const editor = useEditor({
    extensions: [
      KeepMarks,
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-disc list-outside ml-6",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        listItem: {
          HTMLAttributes: {
            class: "ml-2",
          },
        },
      }),
      FontFamily,
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: null,
              parseHTML: (element) => element.style.fontSize,
              renderHTML: (attributes) => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                };
              },
            },
          };
        },
        addKeyboardShortcuts() {
          return {
            // Keep marks when pressing Enter or typing
            Enter: () => {
              const marks =
                this.editor.state.storedMarks ||
                this.editor.state.selection.$from.marks();
              if (marks.length > 0) {
                marks.forEach((mark) => {
                  this.editor.commands.setMark(mark.type.name, mark.attrs);
                });
              }
              return false;
            },
          };
        },
      }),
      Underline,
      Color.configure({
        types: ["textStyle"],
      }),
    ],
    content: processedValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      updateEditorState(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      updateEditorState(editor);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-96 w-full p-4 prose prose-sm max-w-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-dark)] text-gray-800 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_li]:ml-2",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleColorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowColorPicker(!showColorPicker);
  };

  const handleFontSizeClick = (fontSize: string) => {
    if (!editor) return;

    // Get current selection
    const { empty } = editor.state.selection;

    if (!empty) {
      // If there's a selection, apply to selected text
      editor.chain().focus().setMark("textStyle", { fontSize }).run();
    } else {
      // For empty selection (cursor), we need to:
      // 1. Set the mark at cursor position
      // 2. Store it for future typing
      const tr = editor.state.tr;
      const mark = editor.schema.marks.textStyle.create({ fontSize });

      // Add mark to stored marks
      tr.addStoredMark(mark);
      editor.view.dispatch(tr);
      editor.view.focus();
    }

    setActiveFontSize(fontSize);
  };

  const handleTextColor = (hex: string) => {
    if (!editor) return;
    // Apply color and keep it active for typing
    editor.chain().focus().setColor(hex).run();
  };

  return (
    <div className="w-full mb-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-lg">
        {/* Text Style Buttons */}
        <Button
          type="button"
          size="sm"
          variant={isBoldActive ? "default" : "outline"}
          onClick={() => {
            editor.chain().focus().toggleBold().run();
            setIsBoldActive(!isBoldActive);
          }}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          title="Bold"
        >
          <FiBold className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={isItalicActive ? "default" : "outline"}
          onClick={() => {
            editor.chain().focus().toggleItalic().run();
            setIsItalicActive(!isItalicActive);
          }}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          title="Italic"
        >
          <FiItalic className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={isUnderlineActive ? "default" : "outline"}
          onClick={() => {
            editor.chain().focus().toggleUnderline().run();
            setIsUnderlineActive(!isUnderlineActive);
          }}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          title="Underline"
        >
          <FiUnderline className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <div className="w-px bg-gray-300" />

        {/* Font Size Buttons */}
        <Button
          type="button"
          size="sm"
          variant={activeFontSize === "14px" ? "default" : "outline"}
          onClick={() => handleFontSizeClick("14px")}
          className="h-6 sm:h-8 px-1 sm:px-2 text-[10px] sm:text-xs"
          title="14px"
        >
          14px
        </Button>

        <Button
          type="button"
          size="sm"
          variant={activeFontSize === "16px" ? "default" : "outline"}
          onClick={() => handleFontSizeClick("16px")}
          className="h-6 sm:h-8 px-1 sm:px-2 text-[10px] sm:text-xs"
          title="16px"
        >
          16px
        </Button>

        <Button
          type="button"
          size="sm"
          variant={activeFontSize === "20px" ? "default" : "outline"}
          onClick={() => handleFontSizeClick("20px")}
          className="h-6 sm:h-8 px-1 sm:px-2 text-[10px] sm:text-xs"
          title="20px"
        >
          20px
        </Button>

        <Button
          type="button"
          size="sm"
          variant={activeFontSize === "24px" ? "default" : "outline"}
          onClick={() => handleFontSizeClick("24px")}
          className="h-6 sm:h-8 px-1 sm:px-2 text-[10px] sm:text-xs"
          title="24px"
        >
          24px
        </Button>

        <div className="w-px bg-gray-300" />

        {/* Bullet List */}
        <Button
          type="button"
          size="sm"
          variant={isBulletListActive ? "default" : "outline"}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          title="Bullet list"
        >
          <FiList className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        {/* Color Picker */}
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleColorClick}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            title="Text color"
          >
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-gray-400"
              style={{
                backgroundColor:
                  editor.getAttributes("textStyle").color || "#000000",
              }}
            />
          </Button>

          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className="absolute z-50 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <Chrome
                color={editor.getAttributes("textStyle").color || "#000000"}
                onChange={(color) => {
                  handleTextColor(color.hex);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="border-gray-200 rounded-lg min-h-72 sm:min-h-96"
      />
    </div>
  );
}
