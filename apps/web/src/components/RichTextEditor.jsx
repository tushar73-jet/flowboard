"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useState } from "react";
import { Box, HStack, Tooltip, IconButton, Text, Flex } from "@chakra-ui/react";
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Minus
} from "lucide-react";

const TOOLBAR_BUTTONS = [
  { label: "Bold", icon: Bold, action: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive("bold") },
  { label: "Italic", icon: Italic, action: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive("italic") },
  { label: "Strikethrough", icon: Strikethrough, action: (e) => e.chain().focus().toggleStrike().run(), active: (e) => e.isActive("strike") },
  { label: "Code", icon: Code, action: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive("code") },
  { sep: true },
  { label: "Bullet list", icon: List, action: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive("bulletList") },
  { label: "Numbered list", icon: ListOrdered, action: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive("orderedList") },
  { label: "Blockquote", icon: Quote, action: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive("blockquote") },
  { label: "Divider", icon: Minus, action: (e) => e.chain().focus().setHorizontalRule().run(), active: () => false },
];

export default function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Add a description...",
  editable = true,
  maxLength = 5000,
  autoSaveLabel,
}) {
  const [focused, setFocused] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: "outline: none; min-height: 120px; padding: 12px 14px; font-size: 14px; line-height: 1.65; color: rgba(255,255,255,0.8);",
      },
    },
  });

  // Sync content if task changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false);
    }
  }, [content]);

  const charCount = editor?.storage?.characterCount?.characters() ?? 0;

  return (
    <Box
      border="1px solid"
      borderColor={focused ? "brand.500" : "whiteAlpha.100"}
      rounded="xl"
      overflow="hidden"
      bg="rgba(255,255,255,0.03)"
      transition="border-color 0.15s"
    >
      {/* Toolbar */}
      {editable && (
        <HStack
          spacing={0}
          px={2}
          py={1.5}
          borderBottom="1px solid"
          borderColor="whiteAlpha.80"
          bg="rgba(0,0,0,0.15)"
          flexWrap="wrap"
        >
          {TOOLBAR_BUTTONS.map((btn, i) =>
            btn.sep ? (
              <Box key={i} w="1px" h="16px" bg="whiteAlpha.100" mx={1} />
            ) : (
              <Tooltip key={btn.label} label={btn.label} hasArrow placement="top" openDelay={400}>
                <IconButton
                  icon={<btn.icon size={13} />}
                  size="xs"
                  variant="ghost"
                  aria-label={btn.label}
                  color={editor?.isActive ? (btn.active(editor) ? "brand.400" : "whiteAlpha.500") : "whiteAlpha.500"}
                  bg={editor?.isActive && btn.active(editor) ? "rgba(99,102,241,0.15)" : "transparent"}
                  _hover={{ bg: "whiteAlpha.100", color: "white" }}
                  onClick={() => editor && btn.action(editor)}
                  isDisabled={!editor}
                />
              </Tooltip>
            )
          )}
        </HStack>
      )}

      {/* Editor area */}
      <Box
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        sx={{
          "& .ProseMirror": {
            outline: "none",
            minH: "120px",
          },
          "& .ProseMirror p.is-editor-empty:first-child::before": {
            content: "attr(data-placeholder)",
            float: "left",
            color: "rgba(255,255,255,0.2)",
            pointerEvents: "none",
            height: 0,
            fontSize: "14px",
          },
          "& .ProseMirror strong": { color: "rgba(255,255,255,0.95)", fontWeight: 700 },
          "& .ProseMirror em": { color: "rgba(255,255,255,0.85)" },
          "& .ProseMirror code": {
            background: "rgba(99,102,241,0.15)",
            color: "#a78bfa",
            padding: "1px 5px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "monospace",
          },
          "& .ProseMirror blockquote": {
            borderLeft: "3px solid rgba(99,102,241,0.5)",
            paddingLeft: "12px",
            color: "rgba(255,255,255,0.5)",
            fontStyle: "italic",
          },
          "& .ProseMirror ul, & .ProseMirror ol": {
            paddingLeft: "20px",
            color: "rgba(255,255,255,0.75)",
          },
          "& .ProseMirror hr": {
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            margin: "12px 0",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Footer */}
      {editable && (
        <Flex
          px={3}
          py={1.5}
          justify="space-between"
          align="center"
          borderTop="1px solid"
          borderColor="whiteAlpha.50"
          bg="rgba(0,0,0,0.1)"
        >
          <Text fontSize="9px" color="whiteAlpha.300">
            {autoSaveLabel || "Changes saved automatically"}
          </Text>
          <Text
            fontSize="9px"
            color={charCount > maxLength * 0.9 ? "orange.400" : "whiteAlpha.300"}
          >
            {charCount}/{maxLength}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
