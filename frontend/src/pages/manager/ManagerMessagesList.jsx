import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../../components/layout/ManagerLayout";
import { listConversations } from "../../api/messages";
import useToast from "../../hooks/useToast";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
};

const getShortCode = (conversation) => {
  const sourceId = conversation?.booking_id?._id || conversation?._id;
  if (!sourceId) return "";
  return sourceId.slice(-6).toUpperCase();
};

const getTitle = (conversation) => {
  if (conversation?.booking_id?.event_type) {
    return `${conversation.booking_id.event_type} - ${formatDate(conversation.booking_id.event_date)}`;
  }
  return "Event Chat";
};

const getCode = (conversation) => {
  const code = getShortCode(conversation);
  if (!code) return "";
  return `EVT-${code}`;
};

const getInitials = (conversation) => {
  const name = conversation?.customer_id?.full_name || conversation?.customer_id?.email || "Customer";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ManagerMessagesList() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await listConversations();
        if (isMounted) setThreads(data || []);
      } catch (err) {
        notify(err.response?.data?.message || "We could not load messages.", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [notify]);

  return (
    <ManagerLayout>
      <h1>Messages</h1>
      <div className="chat-list">
        {loading && <div className="chat-list-item">Loading conversations...</div>}
        {!loading && threads.length === 0 && (
          <div className="chat-list-item">No conversations yet.</div>
        )}
        {threads.map((thread) => (
          <div
            key={thread._id}
            className="chat-list-item"
            onClick={() => navigate(`/manager/messages/${thread._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(`/manager/messages/${thread._id}`);
            }}
          >
            <div className="chat-list-left">
              <div className="chat-avatar">{getInitials(thread)}</div>
              <div>
                <strong>{getTitle(thread)}</strong>
                <div className="chat-list-meta">{thread.customer_id?.full_name || thread.customer_id?.email || "Customer"}</div>
                <div className="chat-list-meta">{thread.last_message || "No messages yet."}</div>
              </div>
            </div>
            <div className="chat-list-meta">{getCode(thread)} · {formatDate(thread.last_message_at || thread.updatedAt)}</div>
          </div>
        ))}
      </div>
    </ManagerLayout>
  );
}
