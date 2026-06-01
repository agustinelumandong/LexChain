'use client';

import { useState } from 'react';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const initialNotifications = [
  { id: '1', title: 'Document processed', body: 'Contract Agreement.pdf has been fully processed.', time: '2 hours ago', read: false },
  { id: '2', title: 'New whitelist member', body: 'John Doe was added to NDA Draft v2.pdf.', time: '5 hours ago', read: false },
  { id: '3', title: 'Verification complete', body: 'Partnership Agreement is now verified on chain.', time: '1 day ago', read: true },
  { id: '4', title: 'Upload successful', body: 'Employment Contract.pdf was uploaded.', time: '2 days ago', read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#0C2B49]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm font-medium text-[#64748b] mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-full border border-[#E8F0F8] px-4 py-2 text-xs font-bold text-[#0985E7] transition hover:bg-[#F5FAFF]"
          >
            <DoneAllIcon sx={{ fontSize: 16 }} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] p-6 text-center">
          <p className="text-sm font-bold text-[#0C2B49]">No notifications yet</p>
          <p className="text-xs text-[#64748b] mt-1">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-[18px] border border-[#E8F0F8] p-4 transition ${
                n.read
                  ? 'bg-white'
                  : 'bg-[#F5FAFF]'
              }`}
            >
              <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-[#0985E7]'}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#0C2B49]">{n.title}</span>
                <p className="text-xs text-[#64748b] mt-0.5">{n.body}</p>
                <p className="text-[11px] font-bold text-[#A0AAB8] mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
