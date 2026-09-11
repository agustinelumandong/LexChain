'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import type { ApiSchema } from '@/shared/types/index';
import { canAccessPortalFeature } from '@/features/access/portal-access';
import {
  createDemoCategory,
  deactivateDemoCategory,
  editDemoCategory,
  initialDemoCategories,
  type DemoCategory,
} from '@/features/office/category-management';
import { getPortalUiRole } from '@/features/access/portal-role';

type UserProfile = ApiSchema<'UserProfileResponse'>;

async function fetchProfile(): Promise<UserProfile | null> {
  const response = await fetch('/api/portal/proxy?path=%2Fusers%2F', { credentials: 'same-origin' });
  if (!response.ok) return null;
  return response.json();
}

export default function CategoriesPage() {
  const profileQuery = useQuery<UserProfile | null>({ queryKey: ['portal-profile'], queryFn: fetchProfile });
  const [categories, setCategories] = useState<DemoCategory[]>(initialDemoCategories);
  const [editingCategory, setEditingCategory] = useState<DemoCategory | null>(null);
  const [categoryToDeactivate, setCategoryToDeactivate] = useState<DemoCategory | null>(null);
  const [draftName, setDraftName] = useState('');
  const isIssuer = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), 'categories');

  function openCreate() {
    setEditingCategory(null);
    setDraftName('');
  }

  function openEdit(category: DemoCategory) {
    setEditingCategory(category);
    setDraftName(category.name);
  }

  function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftName.trim()) return;

    setCategories((current) => editingCategory
      ? editDemoCategory(current, editingCategory.id, draftName)
      : [...current, createDemoCategory(current, draftName)]);
    setEditingCategory(null);
    setDraftName('');
  }

  if (profileQuery.isLoading) {
    return <p className="py-10 text-sm font-semibold text-[#64748b]">Loading category access…</p>;
  }

  if (!isIssuer) {
    return (
      <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
        <h1 className="text-xl font-black text-[#0C2B49]">Categories are restricted</h1>
        <p className="mt-2 text-sm text-[#64748b]">Only Document Issuers can manage document categories.</p>
      </section>
    );
  }

  const isEditing = editingCategory !== null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-[#0C2B49]">Categories</h1>
          <p className="mt-1 text-sm text-[#64748b]">Organize the office document repository with clear category labels.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white">
          <AddIcon fontSize="small" /> Create Category
        </button>
      </div>

      <p role="status" className="rounded-xl border border-[#CFE7FC] bg-[#F1F8FF] px-4 py-3 text-sm font-semibold text-[#0C5B9C]">
        Demo data — changes reset when this page is refreshed.
      </p>

      <form onSubmit={saveCategory} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
        <h2 className="text-base font-black text-[#0C2B49]">{isEditing ? 'Edit Category' : 'Create Category'}</h2>
        <label className="mt-4 block text-xs font-bold text-[#64748b]" htmlFor="category-name">Category name</label>
        <div className="mt-1 flex flex-wrap gap-3">
          <input id="category-name" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="e.g. Affidavits" className="min-w-0 flex-1 rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm text-[#0C2B49] outline-none focus:border-[#0985E7]" />
          <button type="submit" disabled={!draftName.trim()} className="rounded-xl bg-[#0C2B49] px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{isEditing ? 'Save Changes' : 'Add Category'}</button>
          {isEditing && <button type="button" onClick={openCreate} className="rounded-xl border border-[#D7E4F2] px-4 py-2.5 text-sm font-black text-[#0C2B49]">Cancel</button>}
        </div>
      </form>

      <section className="overflow-hidden rounded-[18px] border border-[#E8F0F8] bg-white">
        <div className="border-b border-[#E8F0F8] px-5 py-4">
          <h2 className="font-black text-[#0C2B49]">Category list</h2>
        </div>
        <ul className="divide-y divide-[#E8F0F8]">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-bold text-[#0C2B49]">{category.name}</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-black ${category.active ? 'bg-[#EAF8F0] text-[#12A150]' : 'bg-[#F1F5F9] text-[#64748b]'}`}>{category.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => openEdit(category)} className="inline-flex items-center gap-1 text-sm font-black text-[#0985E7] hover:underline"><EditOutlinedIcon fontSize="small" /> Edit</button>
                {category.active && <button type="button" onClick={() => setCategoryToDeactivate(category)} className="inline-flex items-center gap-1 text-sm font-black text-[#B45309] hover:underline"><BlockOutlinedIcon fontSize="small" /> Deactivate</button>}
              </div>
            </li>
          ))}
        </ul>
      </section>
      {categoryToDeactivate && (
        <dialog open aria-modal="true" aria-label={`Deactivate ${categoryToDeactivate.name} category`} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_10px_40px_rgba(19,59,115,0.12)]">
          <p className="font-black text-[#0C2B49]">Deactivate {categoryToDeactivate.name}?</p>
          <p className="mt-2 text-sm text-[#64748b]">Documents already using this category keep their existing label.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setCategoryToDeactivate(null)} className="rounded-xl border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0C2B49]">Cancel</button>
            <button type="button" onClick={() => { setCategories((current) => deactivateDemoCategory(current, categoryToDeactivate.id)); setCategoryToDeactivate(null); }} className="rounded-xl bg-[#B45309] px-4 py-2 text-sm font-black text-white">Deactivate category</button>
          </div>
        </dialog>
      )}
    </div>
  );
}
