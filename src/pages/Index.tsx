import { AuthProvider } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
};

export default Index;