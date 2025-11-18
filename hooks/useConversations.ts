import { useState, useEffect } from 'react'
import { useSupabaseUser } from '@/lib/supabase/client'
import { ConversationService, type Conversation, type ConversationMessage } from '@/lib/services/conversation-service'

export function useConversations() {
  const { user, loading: userLoading } = useSupabaseUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar conversas do usuário
  const loadConversations = async () => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userConversations = await ConversationService.getUserConversations(user.id)
      setConversations(userConversations)
      setError(null)
    } catch (err) {
      console.error('Error loading conversations:', err)
      setError('Erro ao carregar conversas')
    } finally {
      setLoading(false)
    }
  }

  // Criar nova conversa
  const createConversation = async (messages: ConversationMessage[], title?: string) => {
    if (!user) return null

    try {
      const conversationTitle = title || ConversationService.generateTitle(messages)
      const newConversation = await ConversationService.createConversation(
        user.id,
        conversationTitle,
        messages
      )

      if (newConversation) {
        setConversations(prev => [newConversation, ...prev])
        return newConversation
      }
      return null
    } catch (err) {
      console.error('Error creating conversation:', err)
      setError('Erro ao criar conversa')
      return null
    }
  }

  // Atualizar conversa existente
  const updateConversation = async (conversationId: string, messages: ConversationMessage[], title?: string) => {
    if (!user) return false

    try {
      const success = await ConversationService.updateConversation(
        conversationId,
        user.id,
        messages,
        title
      )

      if (success) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, messages, title: title || conv.title, updated_at: new Date().toISOString() }
              : conv
          )
        )
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating conversation:', err)
      setError('Erro ao atualizar conversa')
      return false
    }
  }

  // Deletar conversa
  const deleteConversation = async (conversationId: string) => {
    if (!user) return false

    try {
      const success = await ConversationService.deleteConversation(conversationId, user.id)

      if (success) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        return true
      }
      return false
    } catch (err) {
      console.error('Error deleting conversation:', err)
      setError('Erro ao deletar conversa')
      return false
    }
  }

  // Migrar conversas do localStorage
  const migrateLocalConversations = async () => {
    if (!user) return

    try {
      await ConversationService.migrateLocalConversations(user.id)
      await loadConversations() // Recarregar após migração
    } catch (err) {
      console.error('Error migrating conversations:', err)
      setError('Erro ao migrar conversas')
    }
  }

  // Carregar conversas quando usuário estiver disponível
  useEffect(() => {
    if (!userLoading) {
      loadConversations()
    }
  }, [user, userLoading])

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    migrateLocalConversations
  }
}