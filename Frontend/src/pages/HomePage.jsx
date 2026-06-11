import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-full bg-base-100 overflow-hidden">
      <div className="flex h-full w-full">
        <div className="bg-base-100 w-full h-full min-h-0">
          <div className="flex h-full min-h-0 overflow-hidden">
            <div
              className={`h-full shrink-0 w-full md:w-80
                ${selectedUser ? "hidden md:block" : "block"}`}
            >
              <Sidebar />
            </div>

            <div
              className={`flex-1 min-w-0 h-full min-h-0
                ${selectedUser ? "fixed inset-0 z-30 flex md:static md:z-auto" : "hidden md:flex"}`}
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
