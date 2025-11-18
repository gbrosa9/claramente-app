"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, ArrowLeft, Shield, Users, AlertTriangle, FileText, Clock, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
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
              Termos de Uso e Serviço
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
              Leia atentamente antes de usar nossa plataforma
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Última atualização: {lastUpdated}</span>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Idade Mínima</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-600 dark:text-slate-400">
                  <strong>18 anos</strong> ou mais para usar a plataforma
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Não é Terapia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-600 dark:text-slate-400">
                  Apoio educacional, <strong>não substitui</strong> tratamento médico
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center">
                <Scale className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Conformidade Legal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-600 dark:text-slate-400">
                  LGPD, Marco Civil da Internet, CDC
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Terms Content */}
          <Card className="border-purple-200 dark:border-purple-800 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <CardTitle>Termos e Condições Detalhados</CardTitle>
              </div>
              <CardDescription>
                Ao usar o ClaraMENTE, você concorda com todos os termos abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-8">

                {/* 1. Aceite dos Termos */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Aceite dos Termos
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>
                      Ao acessar e usar a plataforma ClaraMENTE ("<strong>Plataforma</strong>"), operada pela ClaraMENTE Tecnologia Ltda. ("<strong>Empresa</strong>", "<strong>nós</strong>", "<strong>nosso</strong>"), você ("<strong>Usuário</strong>", "<strong>você</strong>") concorda em ficar legalmente vinculado a estes Termos de Uso.
                    </p>
                    <p>
                      <strong>Se você não concordar com qualquer parte destes termos, não deve usar nossa Plataforma.</strong>
                    </p>
                  </div>
                </section>

                {/* 2. Verificação de Idade */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Verificação de Idade e Capacidade Legal
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-200">IMPORTANTE - RESTRIÇÃO DE IDADE</p>
                          <p className="text-red-700 dark:text-red-300 mt-1">
                            Você DECLARA e GARANTE que possui <strong>18 (dezoito) anos completos ou mais</strong> na data de aceite destes termos.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>
                      <strong>2.1.</strong> Ao criar uma conta, você declara que:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Possui idade igual ou superior a 18 anos;</li>
                      <li>Possui capacidade civil plena para firmar contratos;</li>
                      <li>Não está impedido legalmente de usar nossos serviços;</li>
                      <li>Todas as informações fornecidas são verdadeiras e precisas.</li>
                    </ul>
                    <p>
                      <strong>2.2.</strong> A Empresa se reserva o direito de solicitar documentos comprobatórios da idade a qualquer momento.
                    </p>
                    <p>
                      <strong>2.3.</strong> Contas criadas por menores de idade serão imediatamente suspensas, sem aviso prévio.
                    </p>
                  </div>
                </section>

                {/* 3. Natureza do Serviço */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Natureza dos Serviços
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-800 dark:text-yellow-200">AVISO IMPORTANTE</p>
                          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                            O ClaraMENTE NÃO É um serviço de terapia, tratamento médico ou psicológico. É uma ferramenta educacional e de apoio ao bem-estar mental.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>
                      <strong>3.1.</strong> A Plataforma oferece:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Conversas educacionais com inteligência artificial ("Clara");</li>
                      <li>Exercícios de bem-estar mental e mindfulness;</li>
                      <li>Conteúdo educacional sobre saúde mental;</li>
                      <li>Ferramentas de autoconhecimento e reflexão;</li>
                      <li>Recursos informativos baseados em terapia cognitivo-comportamental (TCC).</li>
                    </ul>
                    <p>
                      <strong>3.2.</strong> A Plataforma NÃO oferece:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Diagnósticos médicos ou psicológicos;</li>
                      <li>Tratamento para transtornos mentais;</li>
                      <li>Prescrição de medicamentos;</li>
                      <li>Atendimento psicológico ou psiquiátrico;</li>
                      <li>Substituição para cuidados médicos profissionais.</li>
                    </ul>
                    <p>
                      <strong>3.3.</strong> A IA "Clara" é um sistema automatizado educacional e não substitui a orientação de profissionais qualificados.
                    </p>
                  </div>
                </section>

                {/* 4. Limitações e Responsabilidades */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Limitações de Responsabilidade
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-200">EMERGÊNCIAS - PROCURE AJUDA IMEDIATA</p>
                          <p className="text-red-700 dark:text-red-300 mt-1">
                            Em caso de pensamentos suicidas ou emergência psiquiátrica, procure imediatamente: 
                            <br />• <strong>CVV:</strong> 188 (24h gratuito)
                            <br />• <strong>SAMU:</strong> 192
                            <br />• <strong>Hospital/PS</strong> mais próximo
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>
                      <strong>4.1.</strong> A Empresa não se responsabiliza por:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Decisões tomadas baseadas nas informações da Plataforma;</li>
                      <li>Resultados ou eficácia dos exercícios sugeridos;</li>
                      <li>Consequências do uso inadequado da Plataforma;</li>
                      <li>Danos diretos, indiretos, incidentais ou consequenciais;</li>
                      <li>Falhas técnicas, interrupções ou indisponibilidade do serviço.</li>
                    </ul>
                    <p>
                      <strong>4.2.</strong> O Usuário é responsável por:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Buscar acompanhamento profissional quando necessário;</li>
                      <li>Usar a Plataforma com discernimento e responsabilidade;</li>
                      <li>Não compartilhar informações sensíveis ou pessoais desnecessárias;</li>
                      <li>Manter suas credenciais de acesso seguras.</li>
                    </ul>
                  </div>
                </section>

                {/* 5. Uso Aceitável */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    Política de Uso Aceitável
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>5.1.</strong> É <strong>PROIBIDO</strong> usar a Plataforma para:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Atividades ilegais ou que violem direitos de terceiros;</li>
                      <li>Compartilhar conteúdo ofensivo, discriminatório ou inadequado;</li>
                      <li>Tentar burlar sistemas de segurança ou acessar dados não autorizados;</li>
                      <li>Usar bots, scripts ou ferramentas automatizadas não autorizadas;</li>
                      <li>Reproduzir, distribuir ou modificar conteúdo da Plataforma sem autorização;</li>
                      <li>Realizar engenharia reversa ou tentar descobrir código-fonte;</li>
                      <li>Interferir no funcionamento normal da Plataforma.</li>
                    </ul>
                    <p>
                      <strong>5.2.</strong> Violações podem resultar em suspensão ou exclusão permanente da conta.
                    </p>
                  </div>
                </section>

                {/* 6. Propriedade Intelectual */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                    Propriedade Intelectual
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>6.1.</strong> Todo conteúdo da Plataforma (textos, imagens, algoritmos, interface, marca "ClaraMENTE" e "Clara") é propriedade exclusiva da Empresa ou de seus licenciadores.
                    </p>
                    <p>
                      <strong>6.2.</strong> É concedida licença limitada, não exclusiva e revogável para uso pessoal da Plataforma.
                    </p>
                    <p>
                      <strong>6.3.</strong> Conteúdo gerado pelos Usuários permanece de sua propriedade, mas você concede à Empresa licença para processamento e melhoria dos serviços.
                    </p>
                  </div>
                </section>

                {/* 7. Modificações */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                    Modificações dos Termos
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>7.1.</strong> A Empresa pode modificar estes termos a qualquer momento.
                    </p>
                    <p>
                      <strong>7.2.</strong> Mudanças serão notificadas através da Plataforma ou email.
                    </p>
                    <p>
                      <strong>7.3.</strong> Uso continuado após modificações constitui aceite dos novos termos.
                    </p>
                  </div>
                </section>

                {/* 8. Legislação Aplicável */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">8</span>
                    Legislação e Foro
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>8.1.</strong> Estes termos são regidos pelas leis brasileiras, incluindo:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018);</li>
                      <li>Marco Civil da Internet (Lei 12.965/2014);</li>
                      <li>Código de Defesa do Consumidor (Lei 8.078/1990);</li>
                      <li>Código Civil Brasileiro (Lei 10.406/2002).</li>
                    </ul>
                    <p>
                      <strong>8.2.</strong> Fica eleito o foro da Comarca de [CIDADE], Estado de [ESTADO], Brasil, para dirimir quaisquer controvérsias.
                    </p>
                  </div>
                </section>

                {/* 9. Contato */}
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">9</span>
                    Contato e Suporte
                  </h3>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p>Para dúvidas, suporte ou exercício de direitos:</p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p><strong>Email:</strong> suporte@claramente.app</p>
                      <p><strong>Endereço:</strong> [ENDEREÇO COMPLETO]</p>
                      <p><strong>CNPJ:</strong> [NÚMERO DO CNPJ]</p>
                    </div>
                  </div>
                </section>

              </div>

              {/* Acceptance Declaration */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-12">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                    Declaração de Aceite
                  </h4>
                  <p className="text-purple-800 dark:text-purple-200">
                    Ao marcar "Aceito os termos de uso" durante o registro, você declara que:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-purple-700 dark:text-purple-300">
                    <li>Leu, compreendeu e concorda com todos os termos acima;</li>
                    <li>Possui 18 anos ou mais e capacidade legal plena;</li>
                    <li>Entende que o ClaraMENTE não substitui cuidados médicos profissionais;</li>
                    <li>Compromete-se a usar a Plataforma de forma responsável e ética.</li>
                  </ul>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/privacy">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Ler Política de Privacidade
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                Aceitar e Continuar Registro
              </Button>
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}