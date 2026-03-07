import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { UserData } from '../types';

interface AdminListProps {
  users?: UserData[];
  requests?: UserData[];
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function PendingUsersList({ users, onApprove, onReject }: AdminListProps) {
  const [pending, setPending] = useState<UserData[]>([]);

  useEffect(() => {
    if (users) {
      setPending(users);
    } else {
      // Fallback fetch if needed, but we prefer props
      fetch('/api/admin/pending-users')
        .then(res => res.json())
        .then(data => setPending(data))
        .catch(() => {});
    }
  }, [users]);

  return (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <Card className="p-8 text-center text-gray-400 text-sm italic">
          Tidak ada permintaan akun baru.
        </Card>
      ) : (
        pending.map(u => (
          <Card key={u.id_karyawan} className="p-4 flex items-center justify-between bg-white border border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{u.nama_lengkap}</h3>
              <p className="text-xs text-gray-500">{u.jabatan} • ID: {u.id_karyawan}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onApprove(u.id_karyawan)} className="text-xs px-3 py-1">Setujui</Button>
              {onReject && (
                <Button variant="ghost" onClick={() => onReject(u.id_karyawan)} className="text-xs px-3 py-1 text-red-500 hover:bg-red-50">Tolak</Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export function ResetRequestsList({ requests, onApprove, onReject }: AdminListProps) {
  const [items, setItems] = useState<UserData[]>([]);

  useEffect(() => {
    if (requests) {
      setItems(requests);
    } else {
      fetch('/api/admin/reset-requests')
        .then(res => res.json())
        .then(data => setItems(data))
        .catch(() => {});
    }
  }, [requests]);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card className="p-8 text-center text-gray-400 text-sm italic">
          Tidak ada permintaan reset password.
        </Card>
      ) : (
        items.map(u => (
          <Card key={u.id_karyawan} className="p-4 flex items-center justify-between bg-white border border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{u.nama_lengkap}</h3>
              <p className="text-xs text-gray-500">ID: {u.id_karyawan}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onApprove(u.id_karyawan)} className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700">Izinkan Reset</Button>
              {onReject && (
                <Button variant="ghost" onClick={() => onReject(u.id_karyawan)} className="text-xs px-3 py-1 text-red-500 hover:bg-red-50">Tolak</Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
