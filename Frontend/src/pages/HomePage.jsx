import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-100 pt-16">
      <div className="flex h-[calc(100vh-4rem)] w-full">
        <div className="bg-base-100 w-full h-full">
          <div className="flex h-full overflow-hidden">
            <div
              className={`h-full shrink-0 w-full md:w-80
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
