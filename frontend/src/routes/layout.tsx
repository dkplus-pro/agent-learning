import '../globals.css';
import { Layout } from '@arco-design/web-react';
import { Outlet } from '@modern-js/runtime/router';
import { Sidebar, ChatArea } from '@/features/chat/components';

export default function RootLayout() {
  return (
    <Layout className="h-screen">
      <Sidebar />
      <ChatArea />
      <Outlet />
    </Layout>
  );
}
