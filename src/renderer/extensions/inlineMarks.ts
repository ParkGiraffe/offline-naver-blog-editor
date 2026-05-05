import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';

export const inlineMarks = [
  Underline,
  Link.configure({ openOnClick: false, autolink: false }),
  Highlight.configure({ HTMLAttributes: { style: 'background-color:#fff593;' } }),
  TextStyle,
  Color,
];
