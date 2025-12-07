"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, Home, FileText, DollarSign, Wrench, Bell, Settings, Users, BarChart3, LogOut, Menu, X, MessageCircle, Send, Mic, Play, Pause, Paperclip, Image as ImageIcon, User, Mail, Phone, MapPin, Calendar, Edit2, Save, Upload, Check, Clock, AlertCircle, XCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRole = "admin" | "tenant" | "provider";

interface Message {
  id: number;
  sender: "admin" | "tenant";
  type: "text" | "audio";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  audioDuration?: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  birthDate: string;
}

interface PaymentNotification {
  id: number;
  tenantId: string;
  tenantName: string;
  property: string;
  amount: string;
  dueDate: Date;
  daysUntilDue: number;
  status: "pending" | "paid" | "approved" | "overdue";
  receiptUrl?: string;
  receiptFileName?: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  property: string;
  rentAmount: string;
  startDate: string;
  status: "active" | "inactive";
}

interface Conversation {
  id: string;
  tenantId: string;
  tenantName: string;
  property: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

export default function AlugGoApp() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PaymentNotification | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Mock de inquilinos
  const tenants: Tenant[] = [
    {
      id: "tenant1",
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "(11) 98765-4321",
      whatsapp: "5511987654321",
      property: "Kitnet 101",
      rentAmount: "R$ 1.200,00",
      startDate: "01/01/2024",
      status: "active",
    },
    {
      id: "tenant2",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "(11) 98765-1234",
      whatsapp: "5511987651234",
      property: "Kitnet 205",
      rentAmount: "R$ 1.350,00",
      startDate: "15/02/2024",
      status: "active",
    },
    {
      id: "tenant3",
      name: "Pedro Costa",
      email: "pedro.costa@email.com",
      phone: "(11) 98765-5678",
      whatsapp: "5511987655678",
      property: "Kitnet 303",
      rentAmount: "R$ 1.100,00",
      startDate: "10/03/2024",
      status: "active",
    },
    {
      id: "tenant4",
      name: "Ana Oliveira",
      email: "ana.oliveira@email.com",
      phone: "(11) 98765-9012",
      whatsapp: "5511987659012",
      property: "Kitnet 102",
      rentAmount: "R$ 1.250,00",
      startDate: "20/01/2024",
      status: "active",
    },
  ];

  // Mock de conversas (para administrador)
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv1",
      tenantId: "tenant1",
      tenantName: "João Silva",
      property: "Kitnet 101",
      lastMessage: "Obrigado pela explicação!",
      lastMessageTime: new Date(Date.now() - 1800000),
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: "admin",
          type: "text",
          content: "Olá! Como posso ajudar você hoje?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: 2,
          sender: "tenant",
          type: "text",
          content: "Oi! Gostaria de saber sobre o pagamento do próximo mês.",
          timestamp: new Date(Date.now() - 3000000),
        },
        {
          id: 3,
          sender: "admin",
          type: "audio",
          content: "Áudio de resposta",
          timestamp: new Date(Date.now() - 2400000),
          audioUrl: "demo-audio",
          audioDuration: 15,
        },
        {
          id: 4,
          sender: "tenant",
          type: "text",
          content: "Perfeito! Muito obrigado pela explicação.",
          timestamp: new Date(Date.now() - 1800000),
        },
      ],
    },
    {
      id: "conv2",
      tenantId: "tenant2",
      tenantName: "Maria Santos",
      property: "Kitnet 205",
      lastMessage: "Quando posso agendar a visita?",
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 2,
      messages: [
        {
          id: 1,
          sender: "tenant",
          type: "text",
          content: "Olá, preciso falar sobre a manutenção.",
          timestamp: new Date(Date.now() - 10800000),
        },
        {
          id: 2,
          sender: "admin",
          type: "text",
          content: "Claro! Qual o problema?",
          timestamp: new Date(Date.now() - 9000000),
        },
        {
          id: 3,
          sender: "tenant",
          type: "text",
          content: "Quando posso agendar a visita?",
          timestamp: new Date(Date.now() - 7200000),
        },
      ],
    },
    {
      id: "conv3",
      tenantId: "tenant4",
      tenantName: "Ana Oliveira",
      property: "Kitnet 102",
      lastMessage: "Preciso falar sobre o pagamento",
      lastMessageTime: new Date(Date.now() - 14400000),
      unreadCount: 1,
      messages: [
        {
          id: 1,
          sender: "tenant",
          type: "text",
          content: "Preciso falar sobre o pagamento",
          timestamp: new Date(Date.now() - 14400000),
        },
      ],
    },
  ]);

  // Simula notificações de pagamento
  useEffect(() => {
    const today = new Date();
    const mockNotifications: PaymentNotification[] = [
      {
        id: 1,
        tenantId: "tenant1",
        tenantName: "João Silva",
        property: "Kitnet 101",
        amount: "R$ 1.200,00",
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 dias
        daysUntilDue: 5,
        status: "pending",
      },
      {
        id: 2,
        tenantId: "tenant2",
        tenantName: "Maria Santos",
        property: "Kitnet 205",
        amount: "R$ 1.350,00",
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 dias
        daysUntilDue: 2,
        status: "pending",
      },
      {
        id: 3,
        tenantId: "tenant3",
        tenantName: "Pedro Costa",
        property: "Kitnet 303",
        amount: "R$ 1.100,00",
        dueDate: today, // hoje
        daysUntilDue: 0,
        status: "pending",
      },
      {
        id: 4,
        tenantId: "tenant4",
        tenantName: "Ana Oliveira",
        property: "Kitnet 102",
        amount: "R$ 1.250,00",
        dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        daysUntilDue: -3,
        status: "overdue",
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const handlePaymentClick = (notification: PaymentNotification) => {
    setSelectedNotification(notification);
    setShowReceiptModal(true);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitReceipt = () => {
    if (selectedNotification && receiptFile) {
      // Atualiza o status da notificação para "paid" (aguardando aprovação)
      setNotifications(notifications.map(n => 
        n.id === selectedNotification.id 
          ? { ...n, status: "paid", receiptUrl: URL.createObjectURL(receiptFile), receiptFileName: receiptFile.name }
          : n
      ));
      setShowReceiptModal(false);
      setReceiptFile(null);
      setSelectedNotification(null);
    }
  };

  const handleApprovePayment = (notificationId: number) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId 
        ? { ...n, status: "approved" }
        : n
    ));
  };

  const handleRejectPayment = (notificationId: number) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId 
        ? { ...n, status: "pending", receiptUrl: undefined, receiptFileName: undefined }
        : n
    ));
  };

  const handleOpenMessageFromNotification = (tenantName: string) => {
    // Encontra a conversa com o inquilino
    const conversation = conversations.find(c => c.tenantName === tenantName);
    if (conversation) {
      setSelectedConversationId(conversation.id);
      setShowMobileChat(true);
    } else {
      // Cria nova conversa se não existir
      const tenant = tenants.find(t => t.name === tenantName);
      if (tenant) {
        const newConversation: Conversation = {
          id: `conv${conversations.length + 1}`,
          tenantId: tenant.id,
          tenantName: tenant.name,
          property: tenant.property,
          lastMessage: "",
          lastMessageTime: new Date(),
          unreadCount: 0,
          messages: [],
        };
        setConversations([...conversations, newConversation]);
        setSelectedConversationId(newConversation.id);
        setShowMobileChat(true);
      }
    }
    setCurrentPage("messages");
    setIsMobileMenuOpen(false);
    setShowNotificationsDropdown(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowMobileChat(true);
    // Marca mensagens como lidas
    setConversations(conversations.map(c => 
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleCloseMobileChat = () => {
    setShowMobileChat(false);
    setSelectedConversationId(null);
  };

  const handleNotificationClick = (notification: PaymentNotification) => {
    if (userRole === "tenant") {
      // Para inquilino: abre modal de pagamento
      handlePaymentClick(notification);
    } else if (userRole === "admin") {
      // Para admin: abre página de notificações
      setCurrentPage("notifications");
    }
    setShowNotificationsDropdown(false);
  };

  // Conta notificações não lidas
  const unreadNotifications = notifications.filter(n => 
    (userRole === "tenant" && n.status === "pending" && n.daysUntilDue <= 5) ||
    (userRole === "admin" && (n.status === "paid" || n.status === "overdue"))
  ).length;

  // Conta mensagens não lidas totais
  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Filtra notificações para o dropdown
  const dropdownNotifications = userRole === "tenant" 
    ? notifications.filter(n => n.status !== "approved" && n.daysUntilDue <= 5).slice(0, 3)
    : notifications.filter(n => n.status === "paid" || n.status === "overdue").slice(0, 3);

  // Login Screen
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-9 h-9 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AlugGo
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Gestão Inteligente de Kitnets
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setUserRole("admin")}
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Entrar como Administrador
            </Button>
            <Button
              onClick={() => setUserRole("tenant")}
              variant="outline"
              className="w-full h-14 text-lg border-2 hover:bg-blue-50 transition-all duration-300"
            >
              <Home className="w-5 h-5 mr-2" />
              Entrar como Inquilino
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main App Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
              
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AlugGo</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {userRole === "admin" && "Painel Administrativo"}
                  {userRole === "tenant" && "Área do Inquilino"}
                  {userRole === "provider" && "Área do Fornecedor"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>

                {/* Dropdown de Notificações */}
                {showNotificationsDropdown && (
                  <>
                    {/* Overlay para fechar ao clicar fora */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotificationsDropdown(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
                      {/* Header do Dropdown */}
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white text-lg">Notificações</h3>
                          {unreadNotifications > 0 && (
                            <Badge className="bg-white text-blue-600">
                              {unreadNotifications} nova{unreadNotifications > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Lista de Notificações */}
                      <div className="overflow-y-auto flex-1">
                        {dropdownNotifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">Nenhuma notificação</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {dropdownNotifications.map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    notification.status === "overdue" ? "bg-red-100" :
                                    notification.daysUntilDue === 0 ? "bg-orange-100" :
                                    notification.daysUntilDue <= 2 ? "bg-yellow-100" :
                                    notification.status === "paid" ? "bg-blue-100" :
                                    "bg-blue-100"
                                  }`}>
                                    {notification.status === "paid" ? (
                                      <Clock className={`w-5 h-5 text-blue-600`} />
                                    ) : notification.status === "overdue" ? (
                                      <AlertCircle className={`w-5 h-5 text-red-600`} />
                                    ) : (
                                      <DollarSign className={`w-5 h-5 ${
                                        notification.daysUntilDue === 0 ? "text-orange-600" :
                                        notification.daysUntilDue <= 2 ? "text-yellow-600" :
                                        "text-blue-600"
                                      }`} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm mb-1">
                                      {userRole === "admin" ? (
                                        `${notification.tenantName} - ${notification.property}`
                                      ) : (
                                        notification.daysUntilDue < 0 ? `Aluguel atrasado há ${Math.abs(notification.daysUntilDue)} dias` :
                                        notification.daysUntilDue === 0 ? "Aluguel vence hoje!" :
                                        `Aluguel vence em ${notification.daysUntilDue} dias`
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-1">
                                      {notification.amount}
                                    </p>
                                    {notification.status === "paid" && userRole === "admin" && (
                                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                                        Aguardando aprovação
                                      </Badge>
                                    )}
                                    {notification.status === "overdue" && userRole === "admin" && (
                                      <Badge className="bg-red-100 text-red-700 text-xs">
                                        Atrasado
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer do Dropdown */}
                      {dropdownNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <Button
                            variant="ghost"
                            className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setCurrentPage("notifications");
                              setShowNotificationsDropdown(false);
                            }}
                          >
                            Ver todas as notificações
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserRole(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50
            w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out
            md:transform-none md:translate-x-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col min-h-[calc(100vh-4rem)] mt-16 md:mt-0
          `}
        >
          <nav className="flex-1 p-4 space-y-1">
            {userRole === "admin" && (
              <>
                <NavItem icon={BarChart3} label="Dashboard" active={currentPage === "home"} onClick={() => { setCurrentPage("home"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Building2} label="Meus Imóveis" onClick={() => { setCurrentPage("properties"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Users} label="Inquilinos" active={currentPage === "tenants"} onClick={() => { setCurrentPage("tenants"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={FileText} label="Contratos" onClick={() => { setCurrentPage("contracts"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={DollarSign} label="Financeiro" onClick={() => { setCurrentPage("financial"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Wrench} label="Manutenções" onClick={() => { setCurrentPage("maintenance"); setIsMobileMenuOpen(false); }} />
                <NavItem 
                  icon={MessageCircle} 
                  label="Mensagens" 
                  active={currentPage === "messages"} 
                  badge={totalUnreadMessages > 0 ? totalUnreadMessages : undefined}
                  onClick={() => { setCurrentPage("messages"); setSelectedConversationId(null); setShowMobileChat(false); setIsMobileMenuOpen(false); }} 
                />
                <NavItem 
                  icon={Bell} 
                  label="Notificações" 
                  active={currentPage === "notifications"}
                  badge={unreadNotifications > 0 ? unreadNotifications : undefined}
                  onClick={() => { setCurrentPage("notifications"); setIsMobileMenuOpen(false); }} 
                />
                <NavItem icon={User} label="Meu Perfil" active={currentPage === "profile"} onClick={() => { setCurrentPage("profile"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Settings} label="Configurações" onClick={() => { setCurrentPage("settings"); setIsMobileMenuOpen(false); }} />
              </>
            )}
            {userRole === "tenant" && (
              <>
                <NavItem icon={Home} label="Meu Painel" active={currentPage === "home"} onClick={() => { setCurrentPage("home"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Building2} label="Kitnets Disponíveis" onClick={() => { setCurrentPage("available"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={FileText} label="Meu Contrato" onClick={() => { setCurrentPage("contract"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={DollarSign} label="Pagamentos" onClick={() => { setCurrentPage("payments"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Wrench} label="Manutenção" onClick={() => { setCurrentPage("maintenance"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={MessageCircle} label="Mensagens" active={currentPage === "messages"} onClick={() => { setCurrentPage("messages"); setIsMobileMenuOpen(false); }} />
                <NavItem 
                  icon={Bell} 
                  label="Comunicados" 
                  active={currentPage === "notifications"}
                  badge={unreadNotifications > 0 ? unreadNotifications : undefined}
                  onClick={() => { setCurrentPage("notifications"); setIsMobileMenuOpen(false); }} 
                />
                <NavItem icon={User} label="Meu Perfil" active={currentPage === "profile"} onClick={() => { setCurrentPage("profile"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Settings} label="Configurações" onClick={() => { setCurrentPage("settings"); setIsMobileMenuOpen(false); }} />
              </>
            )}
            {userRole === "provider" && (
              <>
                <NavItem icon={Wrench} label="Chamados" active={currentPage === "home"} onClick={() => { setCurrentPage("home"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={BarChart3} label="Meus Serviços" onClick={() => { setCurrentPage("services"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={DollarSign} label="Orçamentos" onClick={() => { setCurrentPage("budgets"); setIsMobileMenuOpen(false); }} />
                <NavItem icon={Settings} label="Configurações" onClick={() => { setCurrentPage("settings"); setIsMobileMenuOpen(false); }} />
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {userRole === "admin" && currentPage === "home" && <AdminDashboard />}
            {userRole === "tenant" && currentPage === "home" && <TenantDashboard notifications={notifications} onPaymentClick={handlePaymentClick} />}
            {userRole === "provider" && currentPage === "home" && <ProviderDashboard />}
            {currentPage === "properties" && <PropertiesPage />}
            {currentPage === "available" && <AvailablePropertiesPage />}
            {currentPage === "tenants" && <TenantsPage tenants={tenants} onSelectTenant={(id) => { setSelectedTenantId(id); setCurrentPage("tenant-details"); }} />}
            {currentPage === "tenant-details" && selectedTenantId && (
              <TenantDetailsPage 
                tenant={tenants.find(t => t.id === selectedTenantId)!} 
                onBack={() => setCurrentPage("tenants")}
                onOpenMessage={(name) => handleOpenMessageFromNotification(name)}
              />
            )}
            {currentPage === "messages" && (
              <MessagesPage 
                userRole={userRole} 
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                showMobileChat={showMobileChat}
                onSelectConversation={handleSelectConversation}
                onCloseMobileChat={handleCloseMobileChat}
                onUpdateConversations={setConversations}
              />
            )}
            {currentPage === "profile" && <ProfilePage userRole={userRole} />}
            {currentPage === "notifications" && (
              <NotificationsPage 
                userRole={userRole} 
                notifications={notifications}
                onPaymentClick={handlePaymentClick}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
                onOpenMessage={handleOpenMessageFromNotification}
              />
            )}
          </div>
        </main>
      </div>

      {/* Receipt Upload Modal */}
      {showReceiptModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Enviar Comprovante de Pagamento</CardTitle>
              <CardDescription>
                {selectedNotification.property} - {selectedNotification.amount}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    {receiptFile ? receiptFile.name : "Clique para selecionar o arquivo"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG até 10MB
                  </p>
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowReceiptModal(false);
                    setReceiptFile(null);
                    setSelectedNotification(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  onClick={handleSubmitReceipt}
                  disabled={!receiptFile}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon: Icon, label, active, badge, onClick }: { icon: any; label: string; active?: boolean; badge?: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
        active
          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

// Tenants Page Component
function TenantsPage({ tenants, onSelectTenant }: { tenants: Tenant[]; onSelectTenant: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Inquilinos</h2>
        <p className="text-gray-600 mt-1">Gerencie seus inquilinos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => onSelectTenant(tenant.id)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>{tenant.property}</CardDescription>
                  </div>
                </div>
                <Badge className={tenant.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                  {tenant.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">Aluguel:</span>
                <span className="font-bold text-gray-900">{tenant.rentAmount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Tenant Details Page Component
function TenantDetailsPage({ tenant, onBack, onOpenMessage }: { tenant: Tenant; onBack: () => void; onOpenMessage: (name: string) => void }) {
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${tenant.whatsapp}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{tenant.name}</h2>
          <p className="text-gray-600 mt-1">Detalhes do Inquilino</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tenant.name}</CardTitle>
                <CardDescription className="text-white/80">{tenant.property}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="w-4 h-4" />
                    <span>E-mail</span>
                  </div>
                  <p className="font-medium text-gray-900">{tenant.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>Telefone</span>
                  </div>
                  <p className="font-medium text-gray-900">{tenant.phone}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg md:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </div>
                  <p className="font-medium text-gray-900">{tenant.whatsapp}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Contrato</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Imóvel</p>
                  <p className="font-semibold text-gray-900">{tenant.property}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor do Aluguel</p>
                  <p className="font-semibold text-gray-900">{tenant.rentAmount}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Data de Início</p>
                  <p className="font-semibold text-gray-900">{tenant.startDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="space-y-4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                onClick={() => onOpenMessage(tenant.name)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={handleWhatsAppClick}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir WhatsApp
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Ver Contrato
              </Button>
              <Button variant="outline" className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Histórico de Pagamentos
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Situação</span>
                <Badge className="bg-green-100 text-green-700">
                  {tenant.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Notifications Page Component
function NotificationsPage({ 
  userRole, 
  notifications,
  onPaymentClick,
  onApprovePayment,
  onRejectPayment,
  onOpenMessage
}: { 
  userRole: UserRole;
  notifications: PaymentNotification[];
  onPaymentClick: (notification: PaymentNotification) => void;
  onApprovePayment: (id: number) => void;
  onRejectPayment: (id: number) => void;
  onOpenMessage: (tenantName: string) => void;
}) {
  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getNotificationMessage = (notification: PaymentNotification) => {
    if (notification.daysUntilDue > 0) {
      return `Seu aluguel vence em ${notification.daysUntilDue} ${notification.daysUntilDue === 1 ? 'dia' : 'dias'}`;
    } else if (notification.daysUntilDue === 0) {
      return "Seu aluguel vence hoje!";
    } else {
      return `Seu aluguel está atrasado há ${Math.abs(notification.daysUntilDue)} ${Math.abs(notification.daysUntilDue) === 1 ? 'dia' : 'dias'}`;
    }
  };

  const getNotificationColor = (notification: PaymentNotification) => {
    if (notification.status === "approved") return "border-green-500 bg-green-50";
    if (notification.status === "paid") return "border-blue-500 bg-blue-50";
    if (notification.daysUntilDue < 0) return "border-red-500 bg-red-50";
    if (notification.daysUntilDue === 0) return "border-orange-500 bg-orange-50";
    if (notification.daysUntilDue <= 2) return "border-yellow-500 bg-yellow-50";
    return "border-blue-500 bg-blue-50";
  };

  const getNotificationIcon = (notification: PaymentNotification) => {
    if (notification.status === "approved") return <Check className="w-6 h-6 text-green-600" />;
    if (notification.status === "paid") return <Clock className="w-6 h-6 text-blue-600" />;
    if (notification.daysUntilDue < 0) return <AlertCircle className="w-6 h-6 text-red-600" />;
    return <Bell className="w-6 h-6 text-blue-600" />;
  };

  // Filtra notificações baseado no tipo de usuário
  const filteredNotifications = userRole === "tenant" 
    ? notifications.filter(n => n.status !== "approved" && n.daysUntilDue <= 5)
    : notifications;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {userRole === "admin" ? "Notificações de Pagamento" : "Comunicados"}
        </h2>
        <p className="text-gray-600 mt-1">
          {userRole === "admin" 
            ? "Gerencie os pagamentos dos inquilinos" 
            : "Acompanhe seus pagamentos e vencimentos"}
        </p>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhuma notificação no momento</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-l-4 ${getNotificationColor(notification)} shadow-lg hover:shadow-xl transition-all duration-300 ${
                userRole === "admin" && notification.daysUntilDue < 0 && notification.status === "pending" ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (userRole === "admin" && notification.daysUntilDue < 0 && notification.status === "pending") {
                  onOpenMessage(notification.tenantName);
                }
              }}
            >
              <CardContent className="p-6 pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {userRole === "tenant" ? (
                      <>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {getNotificationMessage(notification)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.property} - Vencimento: {formatDueDate(notification.dueDate)}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                          {notification.amount}
                        </p>
                        
                        {notification.status === "pending" && (
                          <Button
                            onClick={() => onPaymentClick(notification)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Está Pago!
                          </Button>
                        )}
                        
                        {notification.status === "paid" && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Aguardando aprovação do administrador</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {notification.tenantName} - {notification.property}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Vencimento: {formatDueDate(notification.dueDate)}
                            </p>
                          </div>
                          <Badge className={
                            notification.status === "approved" ? "bg-green-100 text-green-700" :
                            notification.status === "paid" ? "bg-blue-100 text-blue-700" :
                            notification.daysUntilDue < 0 ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }>
                            {notification.status === "approved" ? "Aprovado" :
                             notification.status === "paid" ? "Aguardando Aprovação" :
                             notification.daysUntilDue < 0 ? "Atrasado" :
                             "Pendente"}
                          </Badge>
                        </div>
                        
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                          {notification.amount}
                        </p>

                        {notification.status === "paid" && notification.receiptUrl && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                              <FileText className="w-4 h-4" />
                              <span className="flex-1">{notification.receiptFileName}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(notification.receiptUrl, '_blank')}
                              >
                                Ver Comprovante
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => onApprovePayment(notification.id)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Aprovar Pagamento
                              </Button>
                              <Button
                                onClick={() => onRejectPayment(notification.id)}
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        )}

                        {notification.status === "approved" && (
                          <div className="flex items-center gap-2 text-green-600 bg-white p-3 rounded-lg">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Pagamento aprovado</span>
                          </div>
                        )}

                        {notification.daysUntilDue < 0 && notification.status === "pending" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-600 bg-white p-3 rounded-lg">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-medium">
                                Clique no card para enviar mensagem ao inquilino
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Profile Page Component
function ProfilePage({ userRole }: { userRole: UserRole }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: userRole === "admin" ? "Carlos Administrador" : "João Silva",
    email: userRole === "admin" ? "admin@aluggo.com" : "joao.silva@email.com",
    phone: "(11) 98765-4321",
    whatsapp: "5511987654321",
    cpf: "123.456.789-00",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    birthDate: "15/03/1990",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Aqui você implementaria a lógica de salvar no backend
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meu Perfil</h2>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription className="text-white/80">
                {userRole === "admin" ? "Administrador" : "Inquilino - Kitnet 101"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Informações Pessoais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="disabled:opacity-100 disabled:cursor-default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={profile.cpf}
                  onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
                  disabled={!isEditing}
                  className="disabled:opacity-100 disabled:cursor-default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                  Data de Nascimento
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="birthDate"
                    value={profile.birthDate}
                    onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 disabled:opacity-100 disabled:cursor-default"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 disabled:opacity-100 disabled:cursor-default"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 disabled:opacity-100 disabled:cursor-default"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                  WhatsApp (com código do país)
                </Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    disabled={!isEditing}
                    placeholder="5511987654321"
                    className="pl-10 disabled:opacity-100 disabled:cursor-default"
                  />
                </div>
                <p className="text-xs text-gray-500">Exemplo: 5511987654321 (código do país + DDD + número)</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Endereço
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                  className="disabled:opacity-100 disabled:cursor-default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  Cidade
                </Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  disabled={!isEditing}
                  className="disabled:opacity-100 disabled:cursor-default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  Estado
                </Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  disabled={!isEditing}
                  className="disabled:opacity-100 disabled:cursor-default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                  CEP
                </Label>
                <Input
                  id="zipCode"
                  value={profile.zipCode}
                  onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                  disabled={!isEditing}
                  className="disabled:opacity-100 disabled:cursor-default"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      {userRole === "tenant" && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Informações do Contrato</CardTitle>
            <CardDescription>Dados relacionados ao seu aluguel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Imóvel</p>
                <p className="font-semibold text-gray-900">Kitnet 101</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Valor do Aluguel</p>
                <p className="font-semibold text-gray-900">R$ 1.200,00</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Data de Início</p>
                <p className="font-semibold text-gray-900">01/01/2024</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Vencimento</p>
                <p className="font-semibold text-gray-900">Todo dia 10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Messages Page Component
function MessagesPage({ 
  userRole, 
  conversations,
  selectedConversationId,
  showMobileChat,
  onSelectConversation,
  onCloseMobileChat,
  onUpdateConversations
}: { 
  userRole: UserRole; 
  conversations: Conversation[];
  selectedConversationId: string | null;
  showMobileChat: boolean;
  onSelectConversation: (id: string) => void;
  onCloseMobileChat: () => void;
  onUpdateConversations: (conversations: Conversation[]) => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: selectedConversation.messages.length + 1,
        sender: userRole === "admin" ? "admin" : "tenant",
        type: "text",
        content: newMessage,
        timestamp: new Date(),
      };
      
      const updatedConversations = conversations.map(c => 
        c.id === selectedConversationId 
          ? { 
              ...c, 
              messages: [...c.messages, message],
              lastMessage: newMessage,
              lastMessageTime: new Date()
            }
          : c
      );
      
      onUpdateConversations(updatedConversations);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    if (selectedConversation) {
      // Simula envio de áudio
      const audioMessage: Message = {
        id: selectedConversation.messages.length + 1,
        sender: userRole === "admin" ? "admin" : "tenant",
        type: "audio",
        content: "Mensagem de áudio",
        timestamp: new Date(),
        audioUrl: "recorded-audio",
        audioDuration: recordingTime,
      };
      
      const updatedConversations = conversations.map(c => 
        c.id === selectedConversationId 
          ? { 
              ...c, 
              messages: [...c.messages, audioMessage],
              lastMessage: "🎤 Áudio",
              lastMessageTime: new Date()
            }
          : c
      );
      
      onUpdateConversations(updatedConversations);
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Se for inquilino, mostra apenas o chat direto com admin
  if (userRole === "tenant") {
    const adminConversation: Conversation = {
      id: "admin-chat",
      tenantId: "admin",
      tenantName: "Administração AlugGo",
      property: "",
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: selectedConversation?.messages || [],
    };

    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Mensagens</h2>
          <p className="text-gray-600 mt-1">Converse com o administrador</p>
        </div>

        <Card className="flex-1 flex flex-col border-0 shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Administração AlugGo</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {adminConversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender === "tenant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {isRecording ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-red-50 rounded-xl p-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">
                    Gravando... {formatTime(recordingTime)}
                  </span>
                </div>
                <Button
                  onClick={stopRecording}
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full w-12 h-12"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 border-gray-300 focus:border-blue-500 rounded-xl"
                />
                {newMessage.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full w-12 h-12"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={startRecording}
                    size="icon"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full w-12 h-12"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Para administrador: mostra lista de conversas e chat selecionado
  // Mobile: mostra lista OU chat (não ambos)
  // Desktop: mostra ambos lado a lado
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Mensagens</h2>
        <p className="text-gray-600 mt-1">Converse com seus inquilinos</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* Lista de Conversas - Oculta no mobile quando chat está aberto */}
        <Card className={`md:col-span-1 border-0 shadow-xl overflow-hidden flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardTitle className="text-lg">Conversas</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversationId === conversation.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.tenantName}
                        </h4>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{conversation.property}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage || "Nenhuma mensagem ainda"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conversation.lastMessageTime.toLocaleTimeString("pt-BR", { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Área de Chat - Mostra em tela cheia no mobile quando selecionado */}
        <Card className={`md:col-span-2 border-0 shadow-xl overflow-hidden flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header com botão de voltar no mobile */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-white/20"
                    onClick={onCloseMobileChat}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.tenantName}</h3>
                    <p className="text-xs text-white/80">{selectedConversation.property}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedConversation.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender === "admin"}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                {isRecording ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-red-50 rounded-xl p-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-600">
                        Gravando... {formatTime(recordingTime)}
                      </span>
                    </div>
                    <Button
                      onClick={stopRecording}
                      size="icon"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full w-12 h-12"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 border-gray-300 focus:border-blue-500 rounded-xl"
                    />
                    {newMessage.trim() ? (
                      <Button
                        onClick={handleSendMessage}
                        size="icon"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full w-12 h-12"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={startRecording}
                        size="icon"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full w-12 h-12"
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlayAudio = () => {
    setIsPlaying(!isPlaying);
    // Simula reprodução de áudio
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= (message.audioDuration || 0)) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
        {message.type === "text" ? (
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none"
                : "bg-white text-gray-900 rounded-bl-none shadow-md"
            }`}
          >
            <p className="text-sm break-words">{message.content}</p>
          </div>
        ) : (
          <div
            className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${
              isOwn
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none"
                : "bg-white text-gray-900 rounded-bl-none shadow-md"
            }`}
          >
            <Button
              onClick={togglePlayAudio}
              size="icon"
              variant="ghost"
              className={`w-8 h-8 rounded-full ${
                isOwn ? "hover:bg-white/20" : "hover:bg-gray-100"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <div className="flex-1">
              <div className={`h-1 rounded-full ${isOwn ? "bg-white/30" : "bg-gray-200"}`}>
                <div
                  className={`h-full rounded-full transition-all ${
                    isOwn ? "bg-white" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${((currentTime / (message.audioDuration || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="text-xs font-medium min-w-[40px]">
              {formatTime(isPlaying ? currentTime : message.audioDuration || 0)}
            </span>
          </div>
        )}
        <p
          className={`text-xs mt-1 ${
            isOwn ? "text-gray-500 text-right" : "text-gray-500"
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Visão geral da sua gestão de kitnets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Imóveis"
          value="24"
          subtitle="3 disponíveis"
          icon={Building2}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Inquilinos Ativos"
          value="21"
          subtitle="87.5% ocupação"
          icon={Users}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Receita Mensal"
          value="R$ 32.400"
          subtitle="+12% vs mês anterior"
          icon={DollarSign}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Manutenções"
          value="5"
          subtitle="2 pendentes"
          icon={Wrench}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Recentes</CardTitle>
            <CardDescription>Últimas transações realizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentItem tenant="João Silva" property="Kitnet 101" amount="R$ 1.200,00" status="paid" />
            <PaymentItem tenant="Maria Santos" property="Kitnet 205" amount="R$ 1.350,00" status="paid" />
            <PaymentItem tenant="Pedro Costa" property="Kitnet 303" amount="R$ 1.100,00" status="pending" />
            <PaymentItem tenant="Ana Oliveira" property="Kitnet 102" amount="R$ 1.250,00" status="overdue" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Manutenção</CardTitle>
            <CardDescription>Chamados em aberto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MaintenanceItem property="Kitnet 101" issue="Vazamento na pia" status="open" priority="high" />
            <MaintenanceItem property="Kitnet 205" issue="Lâmpada queimada" status="scheduled" priority="low" />
            <MaintenanceItem property="Kitnet 303" issue="Porta com problema" status="in-progress" priority="medium" />
            <MaintenanceItem property="Kitnet 102" issue="Ar condicionado" status="open" priority="high" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tenant Dashboard
function TenantDashboard({ notifications, onPaymentClick }: { notifications: PaymentNotification[]; onPaymentClick: (notification: PaymentNotification) => void }) {
  // Pega a notificação mais próxima do vencimento
  const nextPayment = notifications
    .filter(n => n.status === "pending" && n.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta!</h2>
        <p className="text-gray-600 mt-1">Kitnet 101 - Rua das Flores, 123</p>
      </div>

      {/* Payment Alert */}
      {nextPayment && (
        <Card className={`border-l-4 ${
          nextPayment.daysUntilDue === 0 ? 'border-l-red-500 bg-red-50' :
          nextPayment.daysUntilDue <= 2 ? 'border-l-orange-500 bg-orange-50' :
          'border-l-yellow-500 bg-yellow-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                nextPayment.daysUntilDue === 0 ? 'bg-red-100' :
                nextPayment.daysUntilDue <= 2 ? 'bg-orange-100' :
                'bg-yellow-100'
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  nextPayment.daysUntilDue === 0 ? 'text-red-600' :
                  nextPayment.daysUntilDue <= 2 ? 'text-orange-600' :
                  'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {nextPayment.daysUntilDue === 0 ? 'Seu aluguel vence hoje!' :
                   nextPayment.daysUntilDue === 1 ? 'Seu aluguel vence amanhã!' :
                   `Próximo Vencimento em ${nextPayment.daysUntilDue} dias`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Vencimento: {nextPayment.dueDate.toLocaleDateString("pt-BR")}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-2">{nextPayment.amount}</p>
                <Button 
                  onClick={() => onPaymentClick(nextPayment)}
                  className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Está Pago!
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard icon={DollarSign} title="Pagamentos" description="Ver histórico" />
        <QuickActionCard icon={FileText} title="Contrato" description="Baixar PDF" />
        <QuickActionCard icon={Wrench} title="Manutenção" description="Abrir chamado" />
        <QuickActionCard icon={Bell} title="Comunicados" description="3 novos" badge="3" />
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <TenantPaymentItem month="Janeiro 2024" amount="R$ 1.200,00" status="paid" date="05/01/2024" />
          <TenantPaymentItem month="Dezembro 2023" amount="R$ 1.200,00" status="paid" date="05/12/2023" />
          <TenantPaymentItem month="Novembro 2023" amount="R$ 1.200,00" status="paid" date="05/11/2023" />
          <TenantPaymentItem month="Outubro 2023" amount="R$ 1.200,00" status="paid" date="05/10/2023" />
        </CardContent>
      </Card>
    </div>
  );
}

// Provider Dashboard
function ProviderDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Chamados Disponíveis</h2>
        <p className="text-gray-600 mt-1">Serviços aguardando orçamento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceCard
          property="Kitnet 101"
          address="Rua das Flores, 123"
          issue="Vazamento na pia da cozinha"
          category="Hidráulica"
          priority="high"
          date="10/02/2024"
        />
        <ServiceCard
          property="Kitnet 205"
          address="Av. Central, 456"
          issue="Instalação de ventilador de teto"
          category="Elétrica"
          priority="medium"
          date="09/02/2024"
        />
        <ServiceCard
          property="Kitnet 303"
          address="Rua do Comércio, 789"
          issue="Porta do banheiro não fecha"
          category="Estrutura"
          priority="low"
          date="08/02/2024"
        />
      </div>
    </div>
  );
}

// Properties Page
function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meus Imóveis</h2>
          <p className="text-gray-600 mt-1">Gerencie suas kitnets</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
          <Building2 className="w-4 h-4 mr-2" />
          Adicionar Imóvel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCard
          name="Kitnet 101"
          address="Rua das Flores, 123"
          price="R$ 1.200,00"
          status="occupied"
          tenant="João Silva"
        />
        <PropertyCard
          name="Kitnet 102"
          address="Rua das Flores, 123"
          price="R$ 1.250,00"
          status="available"
        />
        <PropertyCard
          name="Kitnet 205"
          address="Av. Central, 456"
          price="R$ 1.350,00"
          status="occupied"
          tenant="Maria Santos"
        />
        <PropertyCard
          name="Kitnet 303"
          address="Rua do Comércio, 789"
          price="R$ 1.100,00"
          status="occupied"
          tenant="Pedro Costa"
        />
      </div>
    </div>
  );
}

// Available Properties Page (Tenant View)
function AvailablePropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Kitnets Disponíveis</h2>
        <p className="text-gray-600 mt-1">Encontre seu novo lar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AvailablePropertyCard
          name="Kitnet 102"
          address="Rua das Flores, 123 - Centro"
          price="R$ 1.250,00"
          features={["1 quarto", "1 banheiro", "Cozinha", "30m²"]}
          image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
        />
        <AvailablePropertyCard
          name="Kitnet 304"
          address="Av. Central, 456 - Bairro Novo"
          price="R$ 1.400,00"
          features={["1 quarto", "1 banheiro", "Varanda", "35m²"]}
          image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
        />
        <AvailablePropertyCard
          name="Kitnet 105"
          address="Rua do Comércio, 789 - Centro"
          price="R$ 1.150,00"
          features={["1 quarto", "1 banheiro", "Mobiliada", "28m²"]}
          image="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
        />
      </div>
    </div>
  );
}

// Component Helpers
function StatCard({ title, value, subtitle, icon: Icon, gradient }: any) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentItem({ tenant, property, amount, status }: any) {
  const statusConfig = {
    paid: { label: "Pago", color: "bg-green-100 text-green-700" },
    pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
    overdue: { label: "Atrasado", color: "bg-red-100 text-red-700" },
  };
  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-medium text-gray-900">{tenant}</p>
        <p className="text-sm text-gray-600">{property}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{amount}</p>
        <Badge className={`${config.color} text-xs mt-1`}>{config.label}</Badge>
      </div>
    </div>
  );
}

function MaintenanceItem({ property, issue, status, priority }: any) {
  const statusConfig = {
    open: { label: "Aberto", color: "bg-blue-100 text-blue-700" },
    scheduled: { label: "Agendado", color: "bg-purple-100 text-purple-700" },
    "in-progress": { label: "Em Andamento", color: "bg-yellow-100 text-yellow-700" },
  };
  const priorityConfig = {
    high: { label: "Alta", color: "text-red-600" },
    medium: { label: "Média", color: "text-yellow-600" },
    low: { label: "Baixa", color: "text-green-600" },
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <p className="font-medium text-gray-900">{property}</p>
        <Badge className={statusConfig[status as keyof typeof statusConfig].color}>
          {statusConfig[status as keyof typeof statusConfig].label}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{issue}</p>
      <p className={`text-xs font-medium mt-1 ${priorityConfig[priority as keyof typeof priorityConfig].color}`}>
        Prioridade: {priorityConfig[priority as keyof typeof priorityConfig].label}
      </p>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, badge }: any) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 hover:border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          {badge && (
            <Badge className="bg-red-500 text-white">{badge}</Badge>
          )}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function TenantPaymentItem({ month, amount, status, date }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{month}</p>
        <p className="text-sm text-gray-600">Pago em {date}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{amount}</p>
        <Badge className="bg-green-100 text-green-700 text-xs mt-1">Pago</Badge>
      </div>
    </div>
  );
}

function ServiceCard({ property, address, issue, category, priority, date }: any) {
  const priorityConfig = {
    high: { color: "border-red-500", badge: "bg-red-100 text-red-700" },
    medium: { color: "border-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
    low: { color: "border-green-500", badge: "bg-green-100 text-green-700" },
  };
  const config = priorityConfig[priority as keyof typeof priorityConfig];

  return (
    <Card className={`border-l-4 ${config.color} hover:shadow-lg transition-shadow duration-300`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{property}</CardTitle>
            <CardDescription>{address}</CardDescription>
          </div>
          <Badge className={config.badge}>{priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Problema:</p>
          <p className="font-medium text-gray-900">{issue}</p>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{category}</Badge>
          <p className="text-sm text-gray-600">{date}</p>
        </div>
        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
          Solicitar Reparo
        </Button>
      </CardContent>
    </Card>
  );
}

function PropertyCard({ name, address, price, status, tenant }: any) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{address}</CardDescription>
          </div>
          <Badge className={status === "occupied" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
            {status === "occupied" ? "Ocupado" : "Disponível"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Valor:</span>
          <span className="text-lg font-bold text-gray-900">{price}</span>
        </div>
        {tenant && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Inquilino:</span>
            <span className="font-medium text-gray-900">{tenant}</span>
          </div>
        )}
        <Button variant="outline" className="w-full">
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}

function AvailablePropertyCard({ name, address, price, features, image }: any) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
      <div className="relative h-48 bg-gray-200">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <Badge className="absolute top-3 right-3 bg-green-500 text-white">Disponível</Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>{address}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {features.map((feature: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{price}</span>
          <span className="text-sm text-gray-600">/mês</span>
        </div>
        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg">
          Quero Alugar
        </Button>
      </CardContent>
    </Card>
  );
}
