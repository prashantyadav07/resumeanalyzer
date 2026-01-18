// --- START OF FILE App.jsx ---

import Home from './component/Home.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { useContext } from 'react';
import { Loader2 } from 'lucide-react';

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return <Home />;
}

export default App;