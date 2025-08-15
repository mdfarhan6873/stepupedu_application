'use client'
import React, { useState } from 'react';
import { TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { INameCard } from '@/lib/modals/NameCard';

interface NameCardsListProps {
  cards: INameCard[];
  onCardDeleted: () => void;
}

const NameCardsList: React.FC<NameCardsListProps> = ({ cards, onCardDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/name-cards?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        onCardDeleted();
      } else {
        alert('Failed to delete card');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-36 left-6 z-40 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg p-3 hover:scale-110 transition-all duration-300 flex items-center gap-2"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,80,120,0.15)' }}
        aria-label="View Cards"
      >
        {isOpen ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        <span className="hidden sm:inline text-sm font-semibold">
          {isOpen ? 'Hide' : 'View'} Cards
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  Name Cards ({cards.length})
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <EyeSlashIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No name cards found.</p>
                  <p className="text-gray-400 text-sm mt-2">Add some cards to see them here!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cards.map((card) => (
                    <div
                      key={card._id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {card.name}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {card.tag}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(card._id!)}
                          disabled={deletingId === card._id}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 disabled:opacity-50"
                          aria-label="Delete card"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPercentageColor(card.percentage)}`}>
                          {card.percentage}%
                        </span>
                        <span className="text-xs text-gray-400">
                          {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NameCardsList;