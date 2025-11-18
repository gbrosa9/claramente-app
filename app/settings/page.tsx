"use client"

import { useState, useEffect } from 'react'
import { useSupabaseUser } from '@/lib/supabase/client'
import { useConversations } from '@/hooks/useConversations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SupabaseAuth from '@/components/supabase-auth'
import { ArrowLeft, Download, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { user, loading: userLoading } = useSupabaseUser()
  const { conversations, loading: conversationsLoading, migrateLocalConversations, deleteConversation } = useConversations()
  const [localConversationCount, setLocalConversationCount] = useState(0)
  const [migrating, setMigrating] = useState(false)

  useEffect(() => {
    // Count local conversations
    const userEmail = user?.email || 'default'
    try {
      const localConvs = JSON.parse(localStorage.getItem(`conversations_${userEmail}`) || '[]')
      setLocalConversationCount(localConvs.length)
    } catch {
      setLocalConversationCount(0)
    }
  }, [user])

  const handleMigration = async () => {
    setMigrating(true)
    await migrateLocalConversations()
    setMigrating(false)
    setLocalConversationCount(0)
  }

  const exportConversations = () => {
    const dataStr = JSON.stringify(conversations, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `conversas-clara-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Configurações
          </h1>
        </div>

        <div className="space-y-6">
          {!user ? (
            /* Authentication */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-6"
            >
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">Sincronização de Conversas</CardTitle>
                  <CardDescription className="text-center">
                    Faça login para sincronizar suas conversas entre dispositivos
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <SupabaseAuth />
              
              {localConversationCount > 0 && (
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Você tem <strong>{localConversationCount}</strong> conversas salvas localmente.
                      Faça login para sincronizá-las na nuvem.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            /* User Dashboard */
            <div className="space-y-6">
              {/* User Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Conta Conectada
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Email: {user.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {conversationsLoading ? 'Carregando...' : conversations.length}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Conversas Sincronizadas
                        </p>
                      </div>
                      
                      {localConversationCount > 0 && (
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-orange-600">
                            {localConversationCount}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Conversas Locais (não sincronizadas)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Migration */}
              {localConversationCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Migração de Dados
                      </CardTitle>
                      <CardDescription>
                        Sincronize suas conversas locais para a nuvem
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleMigration}
                        disabled={migrating}
                        className="w-full sm:w-auto"
                      >
                        {migrating ? 'Migrando...' : `Migrar ${localConversationCount} Conversas`}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Isso irá copiar suas conversas locais para a nuvem
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Export */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Exportar Dados
                    </CardTitle>
                    <CardDescription>
                      Faça download de todas suas conversas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={exportConversations}
                      variant="outline"
                      disabled={conversationsLoading || conversations.length === 0}
                      className="w-full sm:w-auto"
                    >
                      Exportar como JSON
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Baixe um arquivo JSON com todas suas conversas
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Trash2 className="w-5 h-5" />
                      Zona de Perigo
                    </CardTitle>
                    <CardDescription>
                      Ações irreversíveis - use com cuidado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja deletar TODAS as conversas? Esta ação é irreversível.')) {
                          conversations.forEach(conv => deleteConversation(conv.id))
                        }
                      }}
                      disabled={conversationsLoading || conversations.length === 0}
                    >
                      Deletar Todas as Conversas
                    </Button>
                    <p className="text-xs text-red-500 mt-2">
                      Esta ação é irreversível
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}