export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin">
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-4 border-blue-600 animate-spin-fast" />
        </div>
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-4 border-cyan-200 animate-spin-reverse">
          <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-t-4 border-cyan-500 animate-spin" />
        </div>
      </div>
    </div>
  );
} 