'use client';

import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  title: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
  buttonAction?: () => void;
}

export default function EmptyState({ 
  title, 
  description, 
  showButton = false, 
  buttonText = 'Xem tài khoản có sẵn',
  buttonAction 
}: EmptyStateProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction();
    } else {
      router.push('/accounts');
    }
  };

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">🎮</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {showButton && (
        <button
          onClick={handleButtonClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
