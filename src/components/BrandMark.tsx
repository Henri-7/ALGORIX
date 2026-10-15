/** The same vector asset powers the wordmark and the browser icon. */
export function BrandMark({ label }: { label?: string }) {
  return (
    <img
      className="brand-mark"
      src="/brand/algorix-symbol.svg"
      width="40"
      height="40"
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
    />
  );
}
