import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';

interface WishlistButtonProps {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'destination' | 'service';
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  id,
  name,
  price,
  image,
  type,
  className = ''
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(id);

  const handleToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ id, name, price, image, type });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-300 ${
        isWishlisted
          ? 'bg-red-500 text-white shadow-lg transform scale-110'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 shadow-md'
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`w-5 h-5 transition-all duration-300 ${
          isWishlisted ? 'fill-current' : ''
        }`} 
      />
    </button>
  );
};

export default WishlistButton;
