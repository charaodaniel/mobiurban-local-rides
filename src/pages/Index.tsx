
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users } from "lucide-react";
import DriversList from "@/components/DriversList";
import DriverLogin from "@/components/DriverLogin";
import DriverDashboard from "@/components/DriverDashboard";
import { useAuthState } from "@/hooks/useAuthState";

const Index = () => {
  const [userType, setUserType] = useState<'passenger' | 'driver' | null>(null);
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se o usuário está logado como motorista, mostrar dashboard
  if (user && userType === 'driver') {
    return <DriverDashboard />;
  }

  // Se escolheu motorista mas não está logado, mostrar login
  if (userType === 'driver' && !user) {
    return <DriverLogin onBack={() => setUserType(null)} />;
  }

  // Se escolheu passageiro, mostrar lista de motoristas
  if (userType === 'passenger') {
    return <DriversList onBack={() => setUserType(null)} />;
  }

  // Tela inicial de seleção
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MobiUrban</h1>
          <p className="text-gray-600">Mobilidade urbana inteligente</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Como você quer continuar?</CardTitle>
            <CardDescription>
              Escolha uma das opções abaixo para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setUserType('passenger')}
              className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
            >
              <Users className="mr-3 h-6 w-6" />
              Sou Passageiro
            </Button>
            
            <Button
              onClick={() => setUserType('driver')}
              variant="outline"
              className="w-full h-16 text-lg border-2 border-green-600 text-green-700 hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
            >
              <Car className="mr-3 h-6 w-6" />
              Sou Motorista
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
