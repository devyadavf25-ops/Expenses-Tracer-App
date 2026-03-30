import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import Chatbot from '../ai/Chatbot';

const Layout = () => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-72 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default Layout;
