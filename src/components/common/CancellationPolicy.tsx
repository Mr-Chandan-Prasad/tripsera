import React, { useState } from 'react';
import { Info, Clock, X, CheckCircle } from 'lucide-react';

interface CancellationPolicyProps {
  className?: string;
}

const CancellationPolicy: React.FC<CancellationPolicyProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const policies = [
    {
      period: 'More than 7 days before travel',
      refund: '100% refund',
      color: 'text-green-600 dark:text-green-400',
      icon: CheckCircle
    },
    {
      period: '3-7 days before travel',
      refund: '75% refund',
      color: 'text-yellow-600 dark:text-yellow-400',
      icon: Clock
    },
    {
      period: '1-3 days before travel',
      refund: '50% refund',
      color: 'text-orange-600 dark:text-orange-400',
      icon: Clock
    },
    {
      period: 'Less than 24 hours',
      refund: 'No refund',
      color: 'text-red-600 dark:text-red-400',
      icon: X
    }
  ];

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
      >
        <Info className="w-4 h-4" />
        Cancellation Policy
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancellation & Refund Policy
          </h3>
          
          <div className="space-y-3">
            {policies.map((policy, index) => {
              const IconComponent = policy.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${policy.color}`} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {policy.period}
                    </span>
                  </div>
                  <span className={`font-semibold ${policy.color}`}>
                    {policy.refund}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Important Notes:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Refunds will be processed within 5-7 business days</li>
              <li>• Cancellation fees may apply for certain services</li>
              <li>• No-show bookings are non-refundable</li>
              <li>• Weather-related cancellations are handled case-by-case</li>
              <li>• Group bookings (5+ people) have special cancellation terms</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              Emergency Cancellations:
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              For medical emergencies or unforeseen circumstances, please contact our customer support 
              at <strong>+91 9876543210</strong> or <strong>support@tripsera.com</strong>. 
              We'll work with you to find the best solution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationPolicy;
