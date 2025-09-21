import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Mail, Copy, Check } from 'lucide-react';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title = 'Check out this amazing destination on Tripsera!',
  description = 'Discover amazing travel destinations and book your dream trip with Tripsera.',
  image = '',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    url,
    title,
    description,
    image
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`
  };

  const handleShare = async (platform: string) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      return;
    }

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.error('Native share failed:', err);
      }
    }

    // Fallback to opening share links
    if (shareLinks[platform as keyof typeof shareLinks]) {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
    }
  };

  const shareButtons = [
    {
      platform: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      platform: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    {
      platform: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      platform: 'email',
      icon: Mail,
      label: 'Email',
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    },
    {
      platform: 'copy',
      icon: copied ? Check : Copy,
      label: copied ? 'Copied!' : 'Copy Link',
      color: copied ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Panel */}
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4 min-w-64">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share this destination
            </h3>
            
            <div className="space-y-2">
              {shareButtons.map((button) => {
                const IconComponent = button.icon;
                return (
                  <button
                    key={button.platform}
                    onClick={() => handleShare(button.platform)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${button.color} ${button.textColor}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{button.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Native Share Button (Mobile) */}
            {navigator.share && (
              <button
                onClick={() => handleShare('native')}
                className="w-full flex items-center gap-3 px-4 py-3 mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share via...</span>
              </button>
            )}

            {/* Share Preview */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {url}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialShare;
