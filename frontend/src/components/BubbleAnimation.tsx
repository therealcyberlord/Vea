export const BubbleAnimation = () => (
  <div className="flex gap-1 mt-2 animate-pulse">
    <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
)
