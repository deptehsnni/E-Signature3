import { UserData, Signature } from '../types';

export const api = {
  auth: {
    login: (body: any) => fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    register: (body: any) => fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    forgotPassword: (id: string) => fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_karyawan: id })
    }),
    checkResetStatus: (id: string) => fetch(`/api/auth/check-reset-status/${id}`),
    resetPassword: (body: any) => fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  },
  admin: {
    getPendingUsers: () => fetch('/api/admin/pending-users').then(res => res.json()),
    getResetRequests: () => fetch('/api/admin/reset-requests').then(res => res.json()),
    fetchAllSignatures: () => fetch('/api/admin/all-signatures').then(res => res.json()),
    approveUser: (id: string) => fetch('/api/admin/approve-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_karyawan: id })
    }),
    rejectUser: (id: string) => fetch('/api/admin/reject-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_karyawan: id })
    }),
    approveReset: (id: string) => fetch('/api/admin/approve-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_karyawan: id })
    }),
    rejectReset: (id: string) => fetch('/api/admin/reject-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_karyawan: id })
    }),
    bulkGenerate: (body: any) => fetch('/api/admin/bulk-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  },
  signatures: {
    fetchByUser: (id: string) => fetch(`/api/signatures/user/${id}`).then(res => res.json()),
    create: (body: any) => fetch('/api/signatures/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    delete: (id: string, id_karyawan: string) => fetch(`/api/signatures/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_karyawan })
    }),
  },
  profile: {
    update: (body: any) => fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    changePassword: (body: any) => fetch('/api/profile/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  },
  verify: {
    check: (hash: string) => fetch(`/api/verify/${hash}`).then(res => res.json()),
  }
};
