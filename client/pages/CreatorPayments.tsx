import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Building, CheckCircle, Clock, AlertCircle, Download, Settings, Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function CreatorPayments() {
  const [selectedBank, setSelectedBank] = useState("");
  const [bankBalance, setBankBalance] = useState(2450.80);

  const paymentHistory = [
    {
      id: 1,
      date: "2024-12-15",
      amount: 890.30,
      description: "Receita Between Heaven Hell - Novembro",
      status: "Pago",
      method: "PIX - Banco do Brasil",
      reference: "BHH-NOV-2024"
    },
    {
      id: 2,
      date: "2024-12-01",
      amount: 750.50,
      description: "Receita Between Heaven Hell - Outubro",
      status: "Pago",
      method: "PIX - Banco do Brasil",
      reference: "BHH-OUT-2024"
    },
    {
      id: 3,
      date: "2024-12-20",
      amount: 320.40,
      description: "Receita Between Heaven Hell - Dezembro",
      status: "Processando",
      method: "PIX - Banco do Brasil",
      reference: "BHH-DEZ-2024"
    },
    {
      id: 4,
      date: "2025-01-05",
      amount: 489.60,
      description: "Receita Between Heaven Hell - Janeiro",
      status: "Pendente",
      method: "A definir",
      reference: "BHH-JAN-2025"
    }
  ];

  const banks = [
    { code: "001", name: "Banco do Brasil" },
    { code: "104", name: "Caixa Econômica Federal" },
    { code: "237", name: "Bradesco" },
    { code: "341", name: "Itaú" },
    { code: "033", name: "Santander" },
    { code: "260", name: "Nu Pagamentos (Nubank)" },
    { code: "323", name: "Mercado Pago" },
    { code: "077", name: "Banco Inter" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pago": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Processando": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Pendente": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago": return "text-green-500";
      case "Processando": return "text-yellow-500";
      case "Pendente": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const totalPaid = paymentHistory.filter(p => p.status === "Pago").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = paymentHistory.filter(p => p.status !== "Pago").reduce((sum, p) => sum + p.amount, 0);

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Sistema de Pagamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas, dados bancários e histórico de pagamentos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-xnema-orange">R$ {bankBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Período promocional ativo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">R$ {totalPaid.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +15.2% vs mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">R$ {totalPending.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Processamento em 3-5 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Atual</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">0%</div>
                <p className="text-xs text-muted-foreground">
                  Período promocional 90 dias
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
              <TabsTrigger value="minibank">Mini Bank</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>

            {/* Payment History */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Todos os seus pagamentos e transferências</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-xnema-surface rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(payment.status)}
                          <div>
                            <h4 className="font-semibold text-foreground">{payment.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {payment.date} • {payment.reference}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">R$ {payment.amount.toFixed(2)}</div>
                          <div className={`text-sm ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.method}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-xnema-border">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Extrato Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bank Data */}
            <TabsContent value="bank" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Bancários</CardTitle>
                  <CardDescription>Configure sua conta para receber pagamentos automáticos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Banco</label>
                      <select 
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        <option value="">Selecione seu banco</option>
                        {banks.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.code} - {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Agência</label>
                        <input 
                          type="text" 
                          placeholder="0000"
                          className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Conta</label>
                        <input 
                          type="text" 
                          placeholder="00000-0"
                          className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Tipo de Conta</label>
                      <select className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground">
                        <option value="corrente">Conta Corrente</option>
                        <option value="poupanca">Conta Poupança</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Chave PIX (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="CPF, email, telefone ou chave aleatória"
                        className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Para recebimentos mais rápidos via PIX
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-foreground">Pagamentos Automáticos</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Após configurar seus dados, os pagamentos serão automáticos toda segunda-feira via PIX ou TED.
                    </p>
                  </div>
                  
                  <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                    Salvar Dados Bancários
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mini Bank */}
            <TabsContent value="minibank" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>XNEMA Mini Bank</CardTitle>
                  <CardDescription>Sistema interno de gestão financeira para criadores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Balance Display */}
                  <div className="bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-2xl p-6 text-center">
                    <h3 className="text-lg font-semibold text-black mb-2">Saldo Atual</h3>
                    <div className="text-4xl font-bold text-black mb-4">R$ {bankBalance.toFixed(2)}</div>
                    <p className="text-black/80">Disponível para saque</p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-xnema-surface">
                      <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center space-x-2">
                          <Plus className="w-5 h-5 text-green-500" />
                          <span>Adicionar Fundos</span>
                        </CardTitle>
                        <CardDescription>Simular entrada de receita</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <input 
                          type="number" 
                          placeholder="Valor em R$"
                          step="0.01"
                          className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <Button 
                          variant="outline" 
                          className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                          onClick={() => setBankBalance(prev => prev + 100)}
                        >
                          + R$ 100 (Teste)
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-xnema-surface">
                      <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center space-x-2">
                          <Minus className="w-5 h-5 text-red-500" />
                          <span>Solicitar Saque</span>
                        </CardTitle>
                        <CardDescription>Transferir para sua conta</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <input 
                          type="number" 
                          placeholder="Valor em R$"
                          step="0.01"
                          max={bankBalance}
                          className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <Button 
                          variant="outline" 
                          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => setBankBalance(prev => Math.max(0, prev - 100))}
                        >
                          Sacar R$ 100
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-xnema-surface rounded-lg">
                      <CreditCard className="w-8 h-8 text-xnema-orange mx-auto mb-2" />
                      <h4 className="font-semibold text-foreground mb-1">PIX Instantâneo</h4>
                      <p className="text-sm text-muted-foreground">Transferências em tempo real</p>
                    </div>
                    
                    <div className="text-center p-4 bg-xnema-surface rounded-lg">
                      <Building className="w-8 h-8 text-xnema-orange mx-auto mb-2" />
                      <h4 className="font-semibold text-foreground mb-1">Multi-Bancos</h4>
                      <p className="text-sm text-muted-foreground">Compatível com todos os bancos</p>
                    </div>
                    
                    <div className="text-center p-4 bg-xnema-surface rounded-lg">
                      <CheckCircle className="w-8 h-8 text-xnema-orange mx-auto mb-2" />
                      <h4 className="font-semibold text-foreground mb-1">Automático</h4>
                      <p className="text-sm text-muted-foreground">Sem necessidade de solicitar</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">💡 Como Funciona</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Suas receitas são creditadas automaticamente no Mini Bank</li>
                      <li>• Você pode acompanhar em tempo real seus ganhos</li>
                      <li>• Transferências automáticas toda segunda-feira</li>
                      <li>• Sem taxas durante o período promocional</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration */}
            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Pagamento</CardTitle>
                  <CardDescription>Configure como e quando receber seus pagamentos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Frequência de Pagamento</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" value="weekly" defaultChecked className="text-xnema-orange" />
                          <span className="text-foreground">Semanal (Toda segunda-feira)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" value="biweekly" className="text-xnema-orange" />
                          <span className="text-foreground">Quinzenal (Dias 1 e 15)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" value="monthly" className="text-xnema-orange" />
                          <span className="text-foreground">Mensal (Todo dia 1)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Valor Mínimo para Saque</h4>
                      <select className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground max-w-xs">
                        <option value="50">R$ 50,00</option>
                        <option value="100">R$ 100,00</option>
                        <option value="200">R$ 200,00</option>
                        <option value="500">R$ 500,00</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Valores abaixo do mínimo ficam acumulados
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Método Preferido</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="method" value="pix" defaultChecked className="text-xnema-orange" />
                          <span className="text-foreground">PIX (Instantâneo)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="method" value="ted" className="text-xnema-orange" />
                          <span className="text-foreground">TED (1 dia útil)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">⚙️ Configurações Administrativas</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Esta seção será configurada pela administração da XNEMA para gerenciar:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Cadastro de bancos suportados</li>
                      <li>• Taxas e comissões por banco</li>
                      <li>• Limites mínimos e máximos</li>
                      <li>• Configurações de segurança</li>
                      <li>• Integração com APIs bancárias</li>
                    </ul>
                    <Button variant="outline" className="mt-4" disabled>
                      Acesso Administrativo Necessário
                    </Button>
                  </div>
                  
                  <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
