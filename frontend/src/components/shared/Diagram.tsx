// Single place that injects an authored SVG string. Same trust model as the
// Markdown lesson: the SVG ships in seed.json, baked into the image, never user
// input. The wrapper normalises sizing (authored SVGs only carry a viewBox) and
// keeps a wide diagram scrolling inside its own box rather than the page.
export function Diagram({ svg }: { svg: string }) {
  return (
    <div
      className="my-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-3
        [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full [&_svg]:max-h-[60vh] text-neutral-700"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
