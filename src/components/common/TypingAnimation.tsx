import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 150,
  className = '',
  showCursor = true,
  cursorChar = '|'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && currentIndex < text.length && (
        <span className="border-r-4 border-orange-400 animate-pulse">{cursorChar}</span>
      )}
    </span>
  );
};

export default TypingAnimation;
