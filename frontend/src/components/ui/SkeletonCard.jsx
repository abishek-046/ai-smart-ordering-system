export default function SkeletonCard({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="food-card p-0 overflow-hidden">
          <div className="h-44 skeleton rounded-t-3xl rounded-b-none" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between gap-3">
              <div className="h-4 skeleton rounded-lg flex-1" />
              <div className="h-4 skeleton rounded-lg w-16" />
            </div>
            <div className="h-3 skeleton rounded-lg w-full" />
            <div className="h-3 skeleton rounded-lg w-2/3" />
            <div className="h-10 skeleton rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
