import '../globals.css';
import { Sidebar, ChatArea } from '@/features/chat/components';

export default function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea />
      </div>
    </div>
  );
}
