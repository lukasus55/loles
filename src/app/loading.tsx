import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
          <Spinner size="lg" className="relative z-10" />
        </div>
        <p className="text-neutral-400 font-medium tracking-widest uppercase text-sm animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
