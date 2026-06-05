import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 sm:pt-20 px-2 sm:px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-5rem)] sm:h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div
              className={`h-full shrink-0 w-full md:w-72
                ${selectedUser ? "hidden md:block" : "block"}`}
            >
              <Sidebar />
            </div>

            <div
              className={`flex-1 min-w-0 h-full
                ${selectedUser ? "flex" : "hidden md:flex"}`}
            >
              {selectedUser ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
