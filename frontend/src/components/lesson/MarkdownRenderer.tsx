import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// `rehype-raw` keeps inline HTML  chiefly <svg>, matching the raw diagram_svg
// already allowed on questions. Same trust model: a single admin authors it.
export default function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="max-w-none text-neutral-800 leading-relaxed space-y-4
      [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-neutral-900 [&_h1]:mt-8 [&_h1]:mb-3
      [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_h2]:mt-8 [&_h2]:mb-2
      [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-neutral-900 [&_h3]:mt-6 [&_h3]:mb-2
      [&_p]:leading-relaxed
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1
      [&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2
      [&_strong]:font-semibold [&_strong]:text-neutral-900
      [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-200 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600 [&_blockquote]:italic
      [&_code]:bg-neutral-100 [&_code]:text-neutral-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
      [&_pre]:bg-neutral-900 [&_pre]:text-neutral-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-sm
      [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0
      [&_hr]:border-neutral-200 [&_hr]:my-8
      [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
      [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
      [&_td]:border [&_td]:border-neutral-200 [&_td]:px-3 [&_td]:py-2
      [&_img]:max-w-full [&_img]:rounded-lg
      [&_svg]:max-w-full [&_svg]:h-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
