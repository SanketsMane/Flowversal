interface LineProps {
  fromElement: string; // CSS selector or data attribute
  toElement: string;
  type?: 'main' | 'sub';
}

export function SimpleConnectingLine({ fromElement, toElement, type = 'sub' }: LineProps) {
  // This component renders a simple SVG line between two elements
  // The actual positioning will be handled by the parent component
  
  const gradient = type === 'main' 
    ? 'from-[#00C6FF] via-[#9D50BB] to-[#00C6FF]'
    : 'from-[#00C6FF]/60 to-[#9D50BB]/60';
    
  const strokeWidth = type === 'main' ? 3 : 2;
  const opacity = type === 'main' ? 0.8 : 0.5;

  return null; // Placeholder - actual implementation will be inline in parent components
}

// Helper function to draw an SVG line between two points
export function drawSVGLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: 'main' | 'sub' = 'sub'
) {
  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  
  return {
    path,
    stroke: type === 'main' ? 'url(#gradient-main)' : 'url(#gradient-sub)',
    strokeWidth: type === 'main' ? 3 : 2,
    opacity: type === 'main' ? 0.8 : 0.5
  };
}

// SVG Gradient Definitions Component
export function ConnectionGradients() {
  return (
    <defs>
      <linearGradient id="gradient-main" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00C6FF" />
        <stop offset="50%" stopColor="#9D50BB" />
        <stop offset="100%" stopColor="#00C6FF" />
      </linearGradient>
      
      <linearGradient id="gradient-sub" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00C6FF" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#9D50BB" stopOpacity="0.6" />
      </linearGradient>
    </defs>
  );
}
