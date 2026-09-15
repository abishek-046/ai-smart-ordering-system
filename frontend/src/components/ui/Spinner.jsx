export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-4' };
  const colors = { primary: 'border-primary-200 border-t-primary-600', white: 'border-white/30 border-t-white' };
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin inline-block`} role="status" aria-label="Loading" />
  );
}
