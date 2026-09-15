export default function SkeletonCard({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-40 bg-gray-200 rounded-xl mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-full mb-1" />
          <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
          <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
