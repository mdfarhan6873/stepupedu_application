'use client'
import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AddNameCardFormProps {
  onCardAdded: () => void;
}

const AddNameCardForm: React.FC<AddNameCardFormProps> = ({ onCardAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    percentage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/name-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          tag: formData.tag,
          percentage: Number(formData.percentage)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ name: '', tag: '', percentage: '' });
        setIsOpen(false);
        onCardAdded();
      } else {
        setError(data.error || 'Failed to add name card');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({ name: '', tag: '', percentage: '' });
    setError('');
  };

  return (
    <>
      {/* Add Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-6 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg p-3 hover:scale-110 transition-all duration-300 flex items-center gap-2"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,120,80,0.15)' }}
        aria-label="Add Name Card"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-semibold">Add Card</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={handleClose}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add Name Card</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                  Tag *
                </label>
                <input
                  type="text"
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  required
                  maxLength={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter tag (e.g., Student, Teacher)"
                />
              </div>

              <div>
                <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage *
                </label>
                <input
                  type="number"
                  id="percentage"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter percentage (0-100)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNameCardForm;