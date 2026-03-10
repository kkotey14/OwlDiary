import React, { useState } from 'react';
import styled from 'styled-components';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background-color: #f8f8f8;
  align-items: center;
`;

const ToolbarBtn = styled.button`
  padding: 0.3rem 0.6rem;
  background: ${({ active }) => (active ? '#d0e8ff' : 'white')};
  border: 1px solid ${({ active }) => (active ? '#4a9eff' : '#ccc')};
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? '600' : '400')};
  transition: all 0.15s ease;

  &:hover {
    background-color: #e8f0ff;
    border-color: #4a9eff;
  }
`;

const ToolbarSelect = styled.select`
  padding: 0.3rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.85rem;
  background: white;
  cursor: pointer;
  max-width: 140px;
`;

const ColorDropdownWrapper = styled.div`
  position: relative;
`;

const ColorDropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  width: 160px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const Swatch = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ active }) => (active ? '#333' : 'transparent')};
  background-color: ${({ color }) => color};
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

const EditorWrapper = styled.div`
  border: 1px solid #ddd;
  border-radius: 0 0 8px 8px;
  min-height: 180px;
  max-height: 400px;
  overflow-y: auto;

  .tiptap {
    padding: 0.8rem;
    min-height: 160px;
    font-size: 1rem;
    outline: none;
    line-height: 1.6;

    p { margin: 0 0 0.5rem 0; }
    ul, ol { padding-left: 1.5rem; }
    h1 { font-size: 1.6rem; margin: 0.5rem 0; }
    h2 { font-size: 1.3rem; margin: 0.5rem 0; }
    a { color: var(--primary-teal); text-decoration: underline; }
  }
`;

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Raleway', value: 'Raleway, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Karla', value: 'Karla, sans-serif' },
  { label: 'Fira Sans', value: 'Fira Sans, sans-serif' },
  { label: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Work Sans', value: 'Work Sans, sans-serif' },
  { label: 'Manrope', value: 'Manrope, sans-serif' },
  { label: 'Rubik', value: 'Rubik, sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Lora', value: 'Lora, serif' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville, serif' },
  { label: 'Crimson Text', value: 'Crimson Text, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
];



const COLORS = [
  '#000000', '#ffffff', '#374151', '#6b7280',
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#f43f5e', '#0ea5e9',
  '#d97706', '#065f46', '#1e3a8a', '#7c3aed',
];


const RichTextEditor = ({ initialContent = '', onChange }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Color,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const currentColor = editor.getAttributes('textStyle').color || '#000000';

  return (
    <>
      <Toolbar>
        <ToolbarBtn
          type="button"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        ><b>B</b></ToolbarBtn>

        <ToolbarBtn
          type="button"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        ><i>I</i></ToolbarBtn>

        <ToolbarBtn
          type="button"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        ><u>U</u></ToolbarBtn>

        <ToolbarBtn
          type="button"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >• List</ToolbarBtn>

        <ToolbarBtn
          type="button"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >1. List</ToolbarBtn>

        <ToolbarSelect
          title="Font Family"
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run();
          }}
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </ToolbarSelect>

        <ColorDropdownWrapper>
          <ToolbarBtn type="button" onClick={() => setColorPickerOpen(prev => !prev)}>
          
          Font Color :&nbsp;
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: currentColor,
            border: '1px solid #aaa',
            marginRight: '0.3rem',
            verticalAlign: 'middle',
          }} />
          ▾
        </ToolbarBtn>
          {colorPickerOpen && (
            <ColorDropdownMenu>
              {COLORS.map((color) => (
                <Swatch
                  key={color}
                  type="button"
                  color={color}
                  title={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setColorPickerOpen(false);
                  }}
                />
              ))}
            </ColorDropdownMenu>
          )}
        </ColorDropdownWrapper>
      </Toolbar>

      <EditorWrapper>
        <EditorContent editor={editor} />
      </EditorWrapper>
    </>
  );
};


export default RichTextEditor;
