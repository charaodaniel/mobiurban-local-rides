
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Phone, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DriverDetails from "./DriverDetails";
import { toast } from "sonner";

interface Driver {
  id: string;
  user_id: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_color: string;
  vehicle_year: number;
  price_per_km: number;
  rating: number;
  is_online: boolean;
  profile_photo_url?: string;
  car_photo_url?: string;
  users: {
    name: string;
    phone: string;
  };
}

interface DriversListProps {
  onBack: () => void;
}

const DriversList = ({ onBack }: DriversListProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const fetchOnlineDrivers = async () => {
    try {
      console.log('Buscando motoristas online...');
      
      // Primeiro, vamos buscar todos os motoristas online
      const { data: driversData, error: driversError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('is_online', true);

      if (driversError) {
        console.error('Erro ao buscar driver_profiles:', driversError);
        throw driversError;
      }

      console.log('Motoristas encontrados:', driversData);

      if (!driversData || driversData.length === 0) {
        console.log('Nenhum motorista online encontrado');
        setDrivers([]);
        return;
      }

      // Agora buscar os dados dos usuários correspondentes
      const userIds = driversData.map(driver => driver.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, phone')
        .in('id', userIds);

      if (usersError) {
        console.error('Erro ao buscar users:', usersError);
        throw usersError;
      }

      console.log('Dados dos usuários:', usersData);

      // Combinar os dados
      const combinedData = driversData.map(driver => {
        const user = usersData?.find(u => u.id === driver.user_id);
        return {
          ...driver,
          users: {
            name: user?.name || 'Nome não disponível',
            phone: user?.phone || ''
          }
        };
      });

      console.log('Dados combinados:', combinedData);
      setDrivers(combinedData);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      toast.error('Erro ao carregar motoristas online');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineDrivers();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('driver-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_profiles'
        },
        (payload) => {
          console.log('Atualização em tempo real:', payload);
          fetchOnlineDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (selectedDriver) {
    return (
      <DriverDetails 
        driver={selectedDriver} 
        onBack={() => setSelectedDriver(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Motoristas Online</h1>
            <p className="text-sm text-gray-600">
              {drivers.length} motorista{drivers.length !== 1 ? 's' : ''} disponível{drivers.length !== 1 ? 'eis' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : drivers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum motorista online</p>
                <p className="text-sm mt-2">Tente novamente em alguns instantes</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {drivers.map((driver) => (
              <Card 
                key={driver.id} 
                className="hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] bg-white/80 backdrop-blur"
                onClick={() => setSelectedDriver(driver)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-green-500">
                      <AvatarImage src={driver.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.users.name}`} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                        {driver.users.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {driver.users.name}
                        </h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Online
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="truncate">
                          {driver.vehicle_color} {driver.vehicle_model} {driver.vehicle_year}
                        </span>
                        <span className="flex items-center gap-1">
                          ⭐ {driver.rating?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        R$ {driver.price_per_km.toFixed(2)}/km
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${driver.users.phone}`, '_self');
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/${driver.users.phone.replace(/\D/g, '')}`, '_blank');
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriversList;
