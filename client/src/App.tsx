import { Toaster } from './components/ui/toaster';
import Layout from './components/layout';
import Routes from './Routes';

function App() {
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
