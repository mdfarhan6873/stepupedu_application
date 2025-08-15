'use client'
import AddNameCardForm from '@/components/AddNameCardForm'
import EnquiriesManager from '@/components/EnquiriesManager'
import NameCardsList from '@/components/NameCardsList'
import { INameCard } from '@/lib/modals/NameCard'
import React, { useEffect, useState } from 'react'

const homepagewithenquaries = () => {
    const [showAppPopup, setShowAppPopup] = useState(false)
      const [nameCards, setNameCards] = useState<INameCard[]>([])
      const [isLoading, setIsLoading] = useState(true)
    
    // Fetch name cards from API
      const fetchNameCards = async () => {
        try {
          const response = await fetch('/api/admin/name-cards')
          const data = await response.json()
          if (data.success) {
            setNameCards(data.data)
          }
        } catch (error) {
          console.error('Error fetching name cards:', error)
        } finally {
          setIsLoading(false)
        }
      }
    
      useEffect(() => {
        fetchNameCards()
      }, [])
    
      const handleCardAdded = () => {
        fetchNameCards()
      }
    
      const handleCardDeleted = () => {
        fetchNameCards()
      }
    
  return (
    <div>
        {/* Floating Action Buttons */}
      <AddNameCardForm onCardAdded={handleCardAdded} />
      <NameCardsList cards={nameCards} onCardDeleted={handleCardDeleted} />
      <EnquiriesManager />

    </div>
  )
}

export default homepagewithenquaries