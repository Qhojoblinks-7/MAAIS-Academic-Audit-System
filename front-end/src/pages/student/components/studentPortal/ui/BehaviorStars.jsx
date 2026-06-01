import React from 'react';
import { cn } from './cn';

export function BehaviorStars({ rating = 0 }) {
  const normalizedRating = Math.min(Math.max(Number(rating) || 0, 0), 5);

  return (
    <div 
      className="flex items-center gap-1.5 py-1"
      role="img"
      aria-label={`Behavior rating: ${normalizedRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = normalizedRating >= starIndex;
        
        return (
          <span
            key={starIndex}
            className={cn(
              // Mobile-first sizing: text-base (16px) is the comfortable baseline for mobile icons. Scales up nicely if needed.
              "text-base sm:text-sm select-none transition-colors duration-150",
              isFilled 
                ? "text-amber-500 font-bold" 
                : "text-gray-200"
            )}
            aria-hidden="true" // Hide individual stars from screen readers since the parent wrapper handles the total context
          >
            ★
          </span>
        );
      })}
    </div>
  );
}