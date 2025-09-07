"use client";

import ChatHeader from '../../../components/ChatHeader';
import MessageList from '../../../components/MessageList';
import Composer from '../../../components/Composer';

export default function ChatsPage() {
  return (
    <div className="chat-pane">
      <ChatHeader />
      <MessageList />
      <Composer />
    </div>
  );
}
