import { LuLoaderCircle } from "react-icons/lu";

export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <LuLoaderCircle className="h-7 w-7 animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}
