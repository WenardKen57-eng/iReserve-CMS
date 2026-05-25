import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomerDashboardLayout from "../../components/layout/CustomerDashboardLayout";
import { getConversation, getMessages, sendMessage } from "../../api/messages";
import useToast from "../../hooks/useToast";
import { AuthContext } from "../../context/AuthContext";
import { getSocket } from "../../api/socket";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const formatShortDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
};

const getTitle = (conversation) => {
  if (conversation?.booking_id?.event_type) {
    return `${conversation.booking_id.event_type} - ${formatShortDate(conversation.booking_id.event_date)}`;
  }
  if (conversation?.inquiry_id?.event_type) {
    return `${conversation.inquiry_id.event_type} - ${formatShortDate(conversation.inquiry_id.event_date)}`;
  }
  return "Support Chat";
};

export default function CustomerMessageThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { notify } = useToast();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const title = useMemo(() => getTitle(conversation), [conversation]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [conversationData, messageData] = await Promise.all([
          getConversation(id),
          getMessages(id)
        ]);
        if (!isMounted) return;
        setConversation(conversationData);
        setMessages(messageData || []);
      } catch (err) {
        notify(err.response?.data?.message || "We could not load this conversation.", "error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (id) load();
    return () => { isMounted = false; };
  }, [id, notify]);

  useEffect(() => {
    if (!id) return undefined;
    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    socket.emit("conversation:join", id);

    const handleNewMessage = (message) => {
      if (String(message?.conversation_id) !== String(id)) return;
      setMessages((prev) => (prev.some((item) => item._id === message._id) ? prev : [...prev, message]));
    };

    const handleTypingStart = (payload) => {
      if (!payload?.user_id || payload.user_id === user?._id) return;
      setTypingUsers((prev) => (prev.some((item) => item.user_id === payload.user_id) ? prev : [...prev, payload]));
    };

    const handleTypingStop = (payload) => {
      if (!payload?.user_id) return;
      setTypingUsers((prev) => prev.filter((item) => item.user_id !== payload.user_id));
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.emit("conversation:leave", id);
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      setTypingUsers([]);
    };
  }, [id, user?._id]);

  const handleSend = async () => {
    const nextBody = draft.trim();
    if (!nextBody || isSending) return;
    setIsSending(true);
    try {
      const message = await sendMessage(id, nextBody);
      setMessages((prev) => (prev.some((item) => item._id === message._id) ? prev : [...prev, message]));
      setDraft("");
      socketRef.current?.emit("typing:stop", id);
    } catch (err) {
      notify(err.response?.data?.message || "We could not send your message.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDraftChange = (event) => {
    setDraft(event.target.value);
    if (!socketRef.current || !id) return;
    socketRef.current.emit("typing:start", id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", id);
    }, 1200);
  };

  const typingLabel = typingUsers.length
    ? `${typingUsers.map((item) => item.name).join(", ")} is typing...`
    : "";

  return (
    <CustomerDashboardLayout
      title="Messages"
      subtitle="Communicate with Caezelle's Catering team"
    >
      <div className="chat-shell">
        <div className="chat-header">
          <div>
            <div className="chat-header-title">{title}</div>
            <div className="chat-subtitle">
              {conversation?.manager_id?.full_name || "Caezelle's Support"}
            </div>
          </div>
          <div className="chat-event-card">
            <span className="chat-event-pill">Support Chat</span>
            <button className="btn-outline" type="button" onClick={() => navigate("/customer/messages")}>Back</button>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-stream">
            {isLoading && <div className="chat-bubble">Loading messages...</div>}
            {!isLoading && messages.length === 0 && (
              <div className="chat-bubble">No messages yet. Start the conversation below.</div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id?._id === user?._id;
              const initials = (msg.sender_id?.full_name || msg.sender_id?.role || "U").slice(0, 2).toUpperCase();
              return (
                <div key={msg._id} className={`chat-message ${isMe ? "me" : ""}`}>
                  <div className={`chat-avatar ${isMe ? "" : "alt"}`}>{initials}</div>
                  <div>
                    <div className={`chat-bubble ${isMe ? "me" : ""}`}>{msg.body}</div>
                    <div className="chat-meta">{formatDateTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {typingLabel && (
            <div className="typing-indicator">
              <span>{typingLabel}</span>
              <span className="typing-dots">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            </div>
          )}

          <div className="chat-input-bar">
            <input
              placeholder="Type your message..."
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
            />
            <div className="chat-actions">
              <button className="btn" type="button" onClick={handleSend} disabled={isSending || !draft.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
