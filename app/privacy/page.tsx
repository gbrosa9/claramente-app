"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, ArrowLeft, Shield, Database, Eye, Lock, FileText, Clock, Users, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  const lastUpdated = "12 de novembro de 2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              ClaraMENTE
            </span>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Registro
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Política de Privacidade
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
              Transparência total sobre como protegemos seus dados
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Última atualização: {lastUpdated}</span>
            </div>
          </div>

          {/* LGPD Compliance Badge */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-green-600" />
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                100% Conforme LGPD
              </h2>
            </div>
            <p className="text-green-700 dark:text-green-300">
              Esta política está em total conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), 
              Marco Civil da Internet e demais regulamentações aplicáveis no Brasil.
            </p>
          </div>

          {/* Quick Overview Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center pb-2">
                <Database className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <CardTitle className="text-sm">Dados Coletados</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Apenas necessários para o serviço
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center pb-2">
                <Lock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <CardTitle className="text-sm">Segurança</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Criptografia AES-256
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center pb-2">
                <Eye className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <CardTitle className="text-sm">Transparência</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Acesso total aos seus dados
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center pb-2">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <CardTitle className="text-sm">Seus Direitos</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Controle completo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Content */}
          <Card className="border-purple-200 dark:border-purple-800 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <CardTitle>Política de Privacidade Completa</CardTitle>
              </div>
              <CardDescription>
                Entenda como coletamos, usamos e protegemos seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-8">

                {/* 1. Controlador de Dados */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Identificação do Controlador
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p><strong>Razão Social:</strong> ClaraMENTE Tecnologia Ltda.</p>
                      <p><strong>CNPJ:</strong> [NÚMERO DO CNPJ]</p>
                      <p><strong>Endereço:</strong> [ENDEREÇO COMPLETO]</p>
                      <p><strong>Email do DPO:</strong> dpo@claramente.app</p>
                      <p><strong>Telefone:</strong> [TELEFONE]</p>
                    </div>
                    <p>
                      Somos o <strong>controlador</strong> dos seus dados pessoais, responsável por determinar as finalidades e meios do tratamento dos seus dados, conforme definido pela LGPD.
                    </p>
                  </div>
                </section>

                {/* 2. Dados Coletados */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Dados Pessoais Coletados
                  </h3>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>Coletamos apenas os dados essenciais para fornecer nossos serviços:</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">2.1. Dados de Cadastro (base legal: execução de contrato)</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Nome completo</strong> - para personalização e identificação</li>
                        <li><strong>Email</strong> - para login, comunicação e recuperação de conta</li>
                        <li><strong>Senha criptografada</strong> - para autenticação segura</li>
                        <li><strong>Data de nascimento</strong> - para verificação de idade (18+)</li>
                        <li><strong>Preferências de idioma</strong> - para personalização</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2.2. Dados de Uso da Plataforma (base legal: legítimo interesse)</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Conversas com a IA Clara</strong> - para funcionamento do serviço</li>
                        <li><strong>Progresso em exercícios</strong> - para acompanhamento pessoal</li>
                        <li><strong>Preferências de configuração</strong> - para personalização</li>
                        <li><strong>Dados de uso agregados</strong> - para melhoria do serviço</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2.3. Dados Técnicos (base legal: legítimo interesse)</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Endereço IP</strong> - para segurança e geolocalização</li>
                        <li><strong>User Agent</strong> - para compatibilidade técnica</li>
                        <li><strong>Logs de acesso</strong> - para segurança e auditoria</li>
                        <li><strong>Cookies técnicos</strong> - para funcionamento da plataforma</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Dados Sensíveis</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>NÃO coletamos</strong> dados sensíveis como informações médicas específicas, diagnósticos ou dados biométricos. 
                        Conversas com a Clara são consideradas dados pessoais comuns para fins educacionais.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Finalidades */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Finalidades do Tratamento
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Usamos seus dados pessoais exclusivamente para:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Finalidades Principais:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Fornecer acesso à plataforma</li>
                          <li>Personalizar conversas com Clara</li>
                          <li>Salvar progresso e preferências</li>
                          <li>Enviar notificações sobre o serviço</li>
                          <li>Suporte técnico e atendimento</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Finalidades Secundárias:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Melhorar algoritmos da IA</li>
                          <li>Análises estatísticas agregadas</li>
                          <li>Prevenção de fraudes e abusos</li>
                          <li>Cumprimento de obrigações legais</li>
                          <li>Exercício regular de direitos</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                      <p className="font-semibold text-green-800 dark:text-green-200 mb-1">Compromisso de Finalidade</p>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        <strong>GARANTIMOS</strong> que seus dados nunca serão usados para outras finalidades sem seu consentimento específico e informado.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 4. Base Legal */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Bases Legais - LGPD
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Tratamos seus dados com base nas seguintes hipóteses legais da LGPD (Art. 7º):</p>
                    <div className="space-y-3">
                      <div className="border-l-4 border-purple-400 pl-4">
                        <h4 className="font-semibold">I - Consentimento (Art. 7º, I)</h4>
                        <p className="text-sm">Coleta de dados durante o cadastro e aceite dos termos</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <h4 className="font-semibold">V - Execução de Contrato (Art. 7º, V)</h4>
                        <p className="text-sm">Dados necessários para funcionamento da plataforma</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <h4 className="font-semibold">IX - Legítimo Interesse (Art. 7º, IX)</h4>
                        <p className="text-sm">Melhoria do serviço, segurança e prevenção de fraudes</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <h4 className="font-semibold">II - Cumprimento de Obrigação Legal (Art. 7º, II)</h4>
                        <p className="text-sm">Retenção de logs para conformidade regulatória</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Compartilhamento */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    Compartilhamento de Dados
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Política de Não Compartilhamento</p>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        <strong>NÃO vendemos, alugamos ou comercializamos seus dados pessoais</strong> em hipótese alguma.
                      </p>
                    </div>
                    
                    <p><strong>Compartilhamento limitado apenas com:</strong></p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">5.1. Prestadores de Serviços (Operadores LGPD)</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li><strong>Supabase (Hospedagem de dados)</strong> - EUA, com cláusulas contratuais padrão</li>
                          <li><strong>OpenAI (API de IA)</strong> - EUA, apenas para processamento de conversas</li>
                          <li><strong>Vercel (Hospedagem da aplicação)</strong> - EUA, apenas dados de navegação</li>
                          <li><strong>Google (Autenticação OAuth)</strong> - apenas email e nome público</li>
                        </ul>
                        <p className="text-sm mt-2">
                          <strong>Garantia:</strong> Todos os fornecedores assinam Acordos de Processamento de Dados (DPAs) com cláusulas de proteção equivalentes à LGPD.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">5.2. Autoridades Competentes</h4>
                        <p className="text-sm">Apenas quando exigido por lei ou ordem judicial válida.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Segurança */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                    Medidas de Segurança
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Implementamos medidas técnicas e organizacionais robustas:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Medidas Técnicas
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Criptografia AES-256 para dados em repouso</li>
                          <li>HTTPS/TLS 1.3 para dados em trânsito</li>
                          <li>Hashing bcrypt para senhas</li>
                          <li>Autenticação multifator disponível</li>
                          <li>Backup criptografado automático</li>
                          <li>Monitoramento 24/7 de segurança</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Medidas Organizacionais
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Treinamento em privacidade para equipe</li>
                          <li>Política de acesso restrito (need-to-know)</li>
                          <li>Auditoria regular de acessos</li>
                          <li>Plano de resposta à incidentes</li>
                          <li>Revisões periódicas de segurança</li>
                          <li>Contratos de confidencialidade (NDAs)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. Retenção */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                    Tempo de Retenção
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Mantemos seus dados apenas pelo tempo necessário:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="border border-slate-200 dark:border-slate-700 p-3 text-left">Tipo de Dado</th>
                            <th className="border border-slate-200 dark:border-slate-700 p-3 text-left">Tempo de Retenção</th>
                            <th className="border border-slate-200 dark:border-slate-700 p-3 text-left">Base Legal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Dados de cadastro</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Até exclusão da conta</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Execução de contrato</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Conversas com Clara</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Até exclusão da conta</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Consentimento/Contrato</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Logs de acesso</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">6 meses</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Legítimo interesse</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Dados agregados</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Indefinido (anonimizados)</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-3">Não se aplica</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* 8. Seus Direitos */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">8</span>
                    Seus Direitos (LGPD Art. 18)
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Como titular dos dados, você tem os seguintes direitos:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">I</div>
                          <div>
                            <h4 className="font-semibold text-sm">Confirmação e Acesso</h4>
                            <p className="text-sm">Saber se tratamos seus dados e acessá-los</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">II</div>
                          <div>
                            <h4 className="font-semibold text-sm">Correção</h4>
                            <p className="text-sm">Corrigir dados incompletos ou inexatos</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">III</div>
                          <div>
                            <h4 className="font-semibold text-sm">Anonimização/Bloqueio</h4>
                            <p className="text-sm">Quando desnecessários ou excessivos</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">IV</div>
                          <div>
                            <h4 className="font-semibold text-sm">Eliminação</h4>
                            <p className="text-sm">Exclusão quando desnecessários</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">V</div>
                          <div>
                            <h4 className="font-semibold text-sm">Portabilidade</h4>
                            <p className="text-sm">Transferir dados para outro fornecedor</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">VI</div>
                          <div>
                            <h4 className="font-semibold text-sm">Eliminação do Consentimento</h4>
                            <p className="text-sm">Revogar consentimento a qualquer momento</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">VII</div>
                          <div>
                            <h4 className="font-semibold text-sm">Informações sobre Compartilhamento</h4>
                            <p className="text-sm">Com quem seus dados são compartilhados</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">VIII</div>
                          <div>
                            <h4 className="font-semibold text-sm">Não Consentir</h4>
                            <p className="text-sm">Recusar coleta quando baseada em consentimento</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Como Exercer Seus Direitos</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                        Para exercer qualquer destes direitos, entre em contato conosco:
                      </p>
                      <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                        <li>• <strong>Email:</strong> dpo@claramente.app</li>
                        <li>• <strong>Prazo de resposta:</strong> até 15 dias úteis</li>
                        <li>• <strong>Gratuito:</strong> exercício gratuito de direitos</li>
                        <li>• Disponível também através da sua conta na plataforma</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 9. Transferência Internacional */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">9</span>
                    Transferência Internacional
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Aviso de Transferência</p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Alguns dos nossos parceiros técnicos estão localizados nos EUA. Todas as transferências são protegidas por:
                      </p>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Cláusulas Contratuais Padrão (SCCs)</strong> aprovadas pela Comissão Europeia</li>
                      <li><strong>Acordos de Processamento de Dados (DPAs)</strong> com garantias LGPD</li>
                      <li><strong>Certificações de segurança</strong> (SOC 2, ISO 27001)</li>
                      <li><strong>Auditorias independentes</strong> regulares</li>
                    </ul>
                    <p className="text-sm">
                      <strong>Garantia:</strong> Seus dados recebem o mesmo nível de proteção da LGPD mesmo quando processados fora do Brasil.
                    </p>
                  </div>
                </section>

                {/* 10. Cookies */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">10</span>
                    Política de Cookies
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Utilizamos cookies para melhorar sua experiência:</p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">Cookies Essenciais (sempre ativos)</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                          <li>Autenticação e sessão do usuário</li>
                          <li>Preferências de idioma e tema</li>
                          <li>Segurança e prevenção de fraudes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold">Cookies de Performance (opcionais)</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                          <li>Análise de uso da plataforma (anonimizada)</li>
                          <li>Métricas de performance técnica</li>
                          <li>Otimização da experiência do usuário</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm">
                      <strong>Controle:</strong> Você pode gerenciar cookies nas configurações do seu navegador ou na sua conta.
                    </p>
                  </div>
                </section>

                {/* 11. Menores */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">11</span>
                    Proteção de Menores
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Restrição de Idade</p>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        Nossa plataforma é destinada EXCLUSIVAMENTE a pessoas com <strong>18 anos ou mais</strong>. 
                        Não coletamos intencionalmente dados de menores de idade.
                      </p>
                    </div>
                    <p>
                      <strong>Se identificarmos</strong> que dados de menores foram coletados:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Excluiremos imediatamente todos os dados</li>
                      <li>Suspenderemos a conta permanentemente</li>
                      <li>Notificaremos responsáveis legais se identificados</li>
                      <li>Aprimoraremos controles de verificação de idade</li>
                    </ul>
                  </div>
                </section>

                {/* 12. Contato DPO */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">12</span>
                    Encarregado de Dados (DPO)
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Nosso Data Protection Officer (DPO) é responsável por:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Orientar sobre cumprimento da LGPD</li>
                      <li>Ser ponto de contato com a ANPD</li>
                      <li>Receber e processar solicitações de titulares</li>
                      <li>Coordenar resposta a incidentes de segurança</li>
                    </ul>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p><strong>Contato do DPO:</strong></p>
                      <p>Email: dpo@claramente.app</p>
                      <p>Resposta em até: 15 dias úteis</p>
                      <p>Disponível: Segunda a Sexta, 9h às 18h</p>
                    </div>
                  </div>
                </section>

                {/* 13. Alterações */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">13</span>
                    Alterações nesta Política
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>13.1.</strong> Esta política pode ser atualizada para refletir mudanças legais, técnicas ou nos nossos serviços.
                    </p>
                    <p>
                      <strong>13.2.</strong> Alterações substanciais serão comunicadas com:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Aviso por email para usuários registrados</li>
                      <li>Notificação na plataforma</li>
                      <li>Prazo de 30 dias para manifestação</li>
                    </ul>
                    <p>
                      <strong>13.3.</strong> Alterações menores (correções, clarificações) entram em vigor imediatamente.
                    </p>
                    <p>
                      <strong>13.4.</strong> Histórico de versões disponível mediante solicitação.
                    </p>
                  </div>
                </section>

              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Dúvidas sobre Privacidade?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Nossa equipe de privacidade está pronta para esclarecer qualquer questão sobre seus dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="mailto:dpo@claramente.app" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Contatar DPO
                </a>
              </Button>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  Aceitar e Continuar Registro
                </Button>
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  )
}