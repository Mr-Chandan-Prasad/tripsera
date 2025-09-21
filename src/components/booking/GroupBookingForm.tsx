import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, Calendar, MapPin } from 'lucide-react';
import DatePicker from '../common/DatePicker';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
}

interface GroupBookingFormProps {
  destination: string;
  basePrice: number;
  onBookingSubmit: (bookingData: any) => void;
}

const GroupBookingForm: React.FC<GroupBookingFormProps> = ({
  destination,
  basePrice,
  onBookingSubmit
}) => {
  const [groupSize, setGroupSize] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [members, setMembers] = useState<GroupMember[]>([
    { id: '1', name: '', email: '', phone: '', age: 0 }
  ]);

  const addMember = () => {
    if (groupSize < 20) { // Max 20 people
      const newMember: GroupMember = {
        id: Date.now().toString(),
        name: '',
        email: '',
        phone: '',
        age: 0
      };
      setMembers([...members, newMember]);
      setGroupSize(groupSize + 1);
    }
  };

  const removeMember = (id: string) => {
    if (groupSize > 1) {
      setMembers(members.filter(member => member.id !== id));
      setGroupSize(groupSize - 1);
    }
  };

  const updateMember = (id: string, field: keyof GroupMember, value: string | number) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const calculateTotal = () => {
    const discount = groupSize >= 10 ? 0.15 : groupSize >= 5 ? 0.10 : 0;
    const subtotal = basePrice * groupSize;
    const discountAmount = subtotal * discount;
    return {
      subtotal,
      discount: discountAmount,
      total: subtotal - discountAmount
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pricing = calculateTotal();
    
    const bookingData = {
      destination,
      groupSize,
      selectedDate,
      members,
      pricing,
      type: 'group'
    };
    
    onBookingSubmit(bookingData);
  };

  const pricing = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Group Booking for {destination}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Book for multiple people and get group discounts!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Size Control */}
        <div className="card-mobile">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Size: {groupSize} {groupSize === 1 ? 'Person' : 'People'}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addMember}
                disabled={groupSize >= 20}
                className="btn-mobile bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
              <button
                type="button"
                onClick={() => removeMember(members[members.length - 1]?.id)}
                disabled={groupSize <= 1}
                className="btn-mobile bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserMinus className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>

          {/* Group Discount Info */}
          {groupSize >= 5 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-300 font-medium">
                🎉 Group Discount Applied! 
                {groupSize >= 10 ? ' 15%' : ' 10%'} off for groups of {groupSize >= 10 ? '10+' : '5+'} people
              </p>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="card-mobile">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Travel Date
          </h3>
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            minDate={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>

        {/* Group Members */}
        <div className="card-mobile">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Group Member Details
          </h3>
          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={member.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Person {index + 1}
                  </h4>
                  {groupSize > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={member.email}
                      onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={member.phone}
                      onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={member.age}
                      onChange={(e) => updateMember(member.id, 'age', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter age"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="card-mobile">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pricing Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Base Price × {groupSize}</span>
              <span className="text-gray-900 dark:text-white">₹{pricing.subtotal.toLocaleString()}</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Group Discount ({groupSize >= 10 ? '15%' : '10%'})</span>
                <span>-₹{pricing.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-primary-600 dark:text-primary-400">₹{pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full btn-mobile bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          Book Group Trip - ₹{pricing.total.toLocaleString()}
        </button>
      </form>
    </div>
  );
};

export default GroupBookingForm;
