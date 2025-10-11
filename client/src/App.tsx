import { Toaster } from './components/ui/toaster';
import Layout from './components/layout';
import Routes from './Routes';
import useAuth from './hooks/use-auth';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-900 text-white">
        <p className="text-lg">Loading QuickServe...</p>
      </div>
    );
  }

  return (
    <>
      <Layout>
        <Routes />
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
