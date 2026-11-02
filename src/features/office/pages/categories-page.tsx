'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'sonner';
import type { ApiSchema } from '@/shared/types';
import { portalFetch } from '@/shared/api/client';
import { canAccessPortalFeature, getPortalUiRole } from '@/features/access';
import { Modal } from '@/features/admin/components/modal';
import { MetricCard } from '@/features/portal/components';
import {
  createCategory,
  deactivateCategory,
  listCategories,
  updateCategory,
  type DocumentCategory,
} from '@/features/office/categories-api';

type UserProfile = ApiSchema<'UserProfileResponse'>;
const categoryQueryKey = ['portal-categories'];

async function fetchProfile(): Promise<UserProfile> {
  return portalFetch<UserProfile>('/users/');
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ['portal-profile'], queryFn: fetchProfile });
  const isIssuer = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), 'categories');
  const categoriesQuery = useQuery<DocumentCategory[]>({
    queryKey: categoryQueryKey,
    queryFn: listCategories,
    enabled: profileQuery.isSuccess && isIssuer,
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
  const [categoryToDeactivate, setCategoryToDeactivate] = useState<DocumentCategory | null>(null);
  const [draftName, setDraftName] = useState('');
  const categoryNameRef = useRef<HTMLInputElement>(null);

  function closeEditor() {
    setEditorOpen(false);
    setEditingCategory(null);
    setDraftName('');
  }

  const saveMutation = useMutation({
    mutationFn: ({ categoryId, name }: { categoryId?: string; name: string }) => {
      const payload = { name };
      return categoryId
        ? updateCategory(categoryId, payload)
        : createCategory(payload);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKey });
      closeEditor();
      toast.success(variables.categoryId ? 'Category updated' : 'Category created');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKey });
      setCategoryToDeactivate(null);
      toast.success('Category deactivated');
    },
  });

  useEffect(() => {
    if (editorOpen) categoryNameRef.current?.focus();
  }, [editorOpen]);

  function openCreate() {
    setEditingCategory(null);
    setDraftName('');
    saveMutation.reset();
    setEditorOpen(true);
  }

  function openEdit(category: DocumentCategory) {
    setEditingCategory(category);
    setDraftName(category.name);
    saveMutation.reset();
    setEditorOpen(true);
  }

  function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    if (!name || name.length > 100 || saveMutation.isPending) return;
    saveMutation.mutate({ categoryId: editingCategory?.id, name });
  }

  if (profileQuery.isLoading) {
    return <p role="status" className="py-10 text-sm font-semibold text-[#5B6F8A]">Loading category access…</p>;
  }

  if (profileQuery.isError && !profileQuery.data) {
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><p>Unable to verify your access to categories.</p><button type="button" onClick={() => void profileQuery.refetch()} className="mt-3 rounded-full border border-red-300 px-4 py-2 font-bold hover:bg-white">Retry</button></div>;
  }

  if (!isIssuer) {
    return (
      <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
        <h1 className="text-xl font-black text-[#0C2B49]">Categories are restricted</h1>
        <p className="mt-2 text-sm text-[#5B6F8A]">Only Document Issuers can manage document categories.</p>
      </section>
    );
  }

  const categories = categoriesQuery.data ?? [];
  const activeCount = categories.filter((category) => category.active).length;
  const inactiveCount = categories.length - activeCount;
  const mutationError = saveMutation.error instanceof Error ? saveMutation.error.message : null;
  const deactivationError = deactivateMutation.error instanceof Error ? deactivateMutation.error.message : null;

  return (
    <div className="flex w-full flex-col gap-5 xl:h-[calc(100dvh-113px)] xl:min-h-0">
      <header className="flex shrink-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0067B3]">LexChain Operations</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">Categories</h1>
          <p className="mt-1 text-sm font-semibold text-[#4B6382]">Organize the office document repository with clear category labels.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#0067B3]/25 transition hover:bg-[#005F9E]">
          <AddIcon fontSize="small" /> Create Category
        </button>
      </header>

      <section className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={<CategoryOutlinedIcon fontSize="small" />} label="Total Categories" value={categoriesQuery.data ? categories.length : '—'} detail="Configured labels" color="bg-[#EAF3FF] text-[#0067B3]" />
        <MetricCard icon={<CheckCircleIcon fontSize="small" />} label="Active" value={categoriesQuery.data ? activeCount : '—'} detail="Available for documents" color="bg-[#EAFBF1] text-[#166534]" />
        <MetricCard icon={<BlockOutlinedIcon fontSize="small" />} label="Inactive" value={categoriesQuery.data ? inactiveCount : '—'} detail="Saved but unavailable" color="bg-[#FFF4DF] text-[#8A5B00]" />
      </section>

      <section className="grid min-h-0 gap-4 xl:flex-1">
        <article className="flex h-fit min-h-[520px] min-w-0 self-start flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 xl:h-full xl:min-h-0">
          <div className="shrink-0 border-b border-[#E4EEF9] p-5">
            <h2 className="text-lg font-black text-[#071B33]">Category Directory</h2>
            <p className="mt-1 text-sm font-semibold text-[#5B6F8A]">Manage the labels available to your office documents.</p>
          </div>
          <div className="admin-table-scroll min-h-0 flex-1 overflow-auto">
            {categoriesQuery.isLoading ? (
              <p role="status" className="p-8 text-center text-sm font-semibold text-[#5B6F8A]">Loading categories…</p>
            ) : categoriesQuery.isError && !categoriesQuery.data ? (
              <div role="alert" className="p-8 text-center">
                <p className="text-sm font-bold text-[#0C2B49]">Unable to load categories</p>
                <p className="mt-1 text-sm text-[#5B6F8A]">{categoriesQuery.error instanceof Error ? categoriesQuery.error.message : 'Please try again.'}</p>
                <button type="button" onClick={() => void categoriesQuery.refetch()} className="mt-4 rounded-full border border-[#D9E5F0] px-4 py-2 text-sm font-black text-[#0067B3]">Retry</button>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <h3 className="text-base font-black text-[#0C2B49]">No categories yet</h3>
                <p className="mt-2 text-sm text-[#5B6F8A]">Create a category to organize documents in your office.</p>
                <button type="button" onClick={openCreate} className="mt-4 rounded-xl bg-[#0067B3] px-4 py-2.5 text-sm font-black text-white">Create first category</button>
              </div>
            ) : (
              <>
                {categoriesQuery.isError && <p role="alert" className="p-4 text-sm font-semibold text-red-700">Unable to refresh categories. Showing the last saved list.</p>}
                <ul className="divide-y divide-[#EEF4F8]">
                  {categories.map((category) => (
                    <li key={category.id} className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 px-5 py-3 transition hover:bg-[#F8FBFF]">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B33]">{category.name}</p>
                        <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black ${category.active ? 'bg-[#EAF8F0] text-[#166534]' : 'bg-[#F1F5F9] text-[#5B6F8A]'}`}>
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${category.active ? 'bg-[#166534]' : 'bg-[#5B6F8A]'}`} />
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" disabled={saveMutation.isPending || deactivateMutation.isPending} onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0067B3] disabled:opacity-50"><EditOutlinedIcon sx={{ fontSize: 18 }} /></button>
                        {category.active && <button type="button" disabled={saveMutation.isPending || deactivateMutation.isPending} onClick={() => { deactivateMutation.reset(); setCategoryToDeactivate(category); }} aria-label={`Deactivate ${category.name}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#FFF4DF] hover:text-[#B45309] disabled:opacity-50"><BlockOutlinedIcon sx={{ fontSize: 18 }} /></button>}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </article>
      </section>

      <Modal open={editorOpen} onClose={() => { if (!saveMutation.isPending) closeEditor(); }} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <p className="text-sm font-semibold text-[#5B6F8A]">{editingCategory ? 'Update an existing category.' : 'Add a label for future documents.'}</p>
        <form onSubmit={saveCategory} className="mt-5">
          <label className="grid gap-1.5 text-sm font-black text-[#0C2B49]" htmlFor="category-name">
            Category name
            <input ref={categoryNameRef} id="category-name" required maxLength={100} value={draftName} onChange={(event) => { setDraftName(event.target.value); if (saveMutation.isError) saveMutation.reset(); }} placeholder="e.g. Affidavits" className="min-w-0 w-full rounded-xl border border-[#D9E5F0] px-3 py-2.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0067B3] focus:ring-2 focus:ring-[#0067B3]/20" />
          </label>
          {mutationError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{mutationError}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button type="button" disabled={saveMutation.isPending} onClick={closeEditor} className="rounded-xl border border-[#D9E5F0] px-4 py-2.5 text-sm font-black text-[#0C2B49] transition hover:border-[#0067B3] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!draftName.trim() || draftName.trim().length > 100 || saveMutation.isPending} className="rounded-xl bg-[#0067B3] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#005F9E] disabled:cursor-not-allowed disabled:opacity-50">{saveMutation.isPending ? 'Saving…' : editingCategory ? 'Save Changes' : 'Add Category'}</button>
          </div>
        </form>
      </Modal>
      {categoryToDeactivate && (
        <Modal
          open
          onClose={() => { if (!deactivateMutation.isPending) setCategoryToDeactivate(null); }}
          title={`Deactivate ${categoryToDeactivate.name}?`}
        >
          <p className="mt-2 text-sm text-[#5B6F8A]">This category will stay in the directory as inactive.</p>
          {deactivationError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{deactivationError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" disabled={deactivateMutation.isPending} onClick={() => setCategoryToDeactivate(null)} className="rounded-xl border border-[#D9E5F0] px-4 py-2 text-sm font-black text-[#0C2B49] disabled:opacity-50">Cancel</button>
            <button type="button" disabled={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(categoryToDeactivate.id)} className="rounded-xl bg-[#B45309] px-4 py-2 text-sm font-black text-white disabled:opacity-50">{deactivateMutation.isPending ? 'Deactivating…' : 'Deactivate category'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
