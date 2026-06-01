'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

async function fetchNotifications(): Promise<{ notifications: Notification[]; total: number }> {
  const res = await fetch('/api/portal/proxy?path=%2Fnotifications%2F', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

async function markAllRead() {
  const res = await fetch('/api/portal/proxy-post?path=%2Fnotifications%2Fread-all', {
    method: 'PATCH',
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Failed');
}

async function markOneRead(id: string) {
  const res = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/notifications/${id}/read`)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Failed');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['portal-notifications'],
    queryFn: fetchNotifications,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-notifications'] }),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#0C2B49]">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm font-medium text-[#64748b] mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-2 rounded-full border border-[#E8F0F8] px-4 py-2 text-xs font-bold text-[#0985E7] transition hover:bg-[#F5FAFF] disabled:opacity-50"
          >
            <DoneAllIcon sx={{ fontSize: 16 }} />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-[18px] border border-[#E8F0F8] h-[72px] animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-[18px] border border-[#E8F0F8] p-6 text-center">
          <p className="text-sm font-bold text-[#0C2B49]">No notifications yet</p>
          <p className="text-xs text-[#64748b] mt-1">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markOneMutation.mutate(n.id)}
              className={`flex items-start gap-3 rounded-[18px] border border-[#E8F0F8] p-4 text-left w-full transition ${n.is_read ? 'bg-white' : 'bg-[#F5FAFF] cursor-pointer hover:bg-[#EEF6FF]'}`}
            >
              <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-[#0985E7]'}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#0C2B49]">{n.title}</span>
                <p className="text-xs text-[#64748b] mt-0.5">{n.body}</p>
                <p className="text-[11px] font-bold text-[#A0AAB8] mt-1">{formatDate(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
