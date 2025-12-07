"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Eye, MessageCircle, X, Check, Send } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  features?: string[];
  image?: string;
  status: string;
  description?: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

// Marketplace de Kitnets Disponíveis para Inquilinos
export default function AvailablePropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const fetchAvailableProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = async () => {
    if (!selectedProperty || !contactMessage.trim()) return;

    setSending(true);
    try {
      // Simular tenant_id (em produção, viria da autenticação)
      const tenantId = 'tenant1'; // Mock - em produção usar auth

      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: 'Inquilino Interessado', // Mock - em produção usar dados do perfil
          email: 'tenant@email.com', // Mock
          subject: `Interesse no imóvel: ${selectedProperty.name}`,
          message: contactMessage
        });

      if (error) throw error;

      // Também criar uma solicitação de alocação
      await supabase
        .from('allocation_requests')
        .insert({
          tenant_id: tenantId,
          property_id: selectedProperty.id,
          status: 'pending'
        });

      alert('Mensagem enviada com sucesso! O administrador entrará em contato em breve.');
      setShowContactModal(false);
      setContactMessage('');
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando imóveis disponíveis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kitnets Disponíveis</h2>
          <p className="text-gray-600 mt-1">Encontre seu novo lar - Marketplace de imóveis</p>
        </div>

        {properties.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum imóvel disponível no momento</p>
              <p className="text-sm text-gray-400 mt-2">Volte mais tarde para ver novas oportunidades</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
                <div className="relative h-48 bg-gray-200">
                  {property.image ? (
                    <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-green-500 text-white">Disponível</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {property.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.features && property.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {property.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {property.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.features.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {property.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-gray-600">/mês</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedProperty(property)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowContactModal(true);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contato
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Property Details Modal */}
        {selectedProperty && !showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedProperty.name}</CardTitle>
                    <CardDescription className="text-white/80 flex items-center gap-1 mt-2">
                      <MapPin className="w-4 h-4" />
                      {selectedProperty.address}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedProperty(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Image */}
                <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                  {selectedProperty.image ? (
                    <img src={selectedProperty.image} alt={selectedProperty.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Building2 className="w-24 h-24 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {selectedProperty.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">Valor mensal do aluguel</p>
                </div>

                {/* Description */}
                {selectedProperty.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                    <p className="text-gray-600">{selectedProperty.description}</p>
                  </div>
                )}

                {/* Features */}
                {selectedProperty.features && selectedProperty.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedProperty.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedProperty(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Entrar em Contato
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Entrar em Contato</CardTitle>
                <CardDescription>
                  Interesse no imóvel: {selectedProperty.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message">Mensagem para o administrador</Label>
                  <textarea
                    id="message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Olá! Tenho interesse neste imóvel. Gostaria de agendar uma visita..."
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactMessage('');
                    }}
                    disabled={sending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    onClick={handleContactAdmin}
                    disabled={!contactMessage.trim() || sending}
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
