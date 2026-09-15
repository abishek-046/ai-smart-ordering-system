export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16 card">
      <div className="text-5xl mb-4">{icon}</div>
      {title && <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
