import { motion } from "framer-motion";
import { Play, Youtube } from "lucide-react";

interface VideoCardProps {
  id?: string;
  searchQuery: string;
  title: string;
  channel: string;
  index?: number;
}

// A palette of warm gradient pairs for variety
const GRADIENTS = [
  "from-orange-900/60 to-red-900/60",
  "from-amber-900/60 to-orange-900/60",
  "from-red-900/60 to-rose-900/60",
  "from-yellow-900/60 to-amber-900/60",
  "from-orange-800/60 to-yellow-900/60",
];

export function VideoCard({ id, searchQuery, title, channel, index = 0 }: VideoCardProps) {
  // Always open a YouTube search — guaranteed to work for any recipe name
  const href = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <motion.a
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block relative overflow-hidden rounded-2xl glass-strong"
    >
      {/* Gradient thumbnail — never breaks */}
      <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {/* Decorative food emoji / icon pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[80px] select-none">
          🍛
        </div>
        {/* YouTube icon watermark */}
        <div className="absolute top-3 right-3 opacity-30">
          <Youtube className="h-6 w-6 text-white" />
        </div>
        {/* Play button */}
        <div className="relative h-14 w-14 rounded-full bg-gradient-ember grid place-items-center shadow-ember group-hover:scale-110 transition-transform duration-300">
          <Play className="h-5 w-5 text-primary-foreground fill-current ml-1" />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">{title}</h4>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-muted-foreground">{channel}</p>
          <span className="text-[10px] text-primary flex items-center gap-1 opacity-70">
            <Youtube className="h-3 w-3" /> Watch
          </span>
        </div>
      </div>
    </motion.a>
  );
}
