export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  const borders = {
    primary: { border: '2px solid rgba(217,119,6,0.2)', borderTopColor: '#d97706' },
    white:   { border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' },
  };
  return (
    <div
      className={`${sizes[size]} rounded-full animate-spin inline-block flex-shrink-0`}
      style={borders[color] || borders.primary}
      role="status"
      aria-label="Loading"
    />
  );
}
