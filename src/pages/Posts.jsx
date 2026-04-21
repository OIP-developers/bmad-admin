import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { adminApi } from "../api/admin";

export default function Posts() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ posts: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    adminApi
      .listPosts({ page, limit: 25 })
      .then((res) => {
        if (res.success) setData(res.data);
        else setErr(res.msg || "Failed to load");
      })
      .catch((e) =>
        setErr(e.response?.data?.msg || e.message || "Network error")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const del = async (post_id) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusyId(post_id);
    try {
      await adminApi.deletePost(post_id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / 25));

  return (
    <>
      <PageHeader title="Posts" subtitle={`${data.total || 0} total posts`} />

      <div className="p-8">
        {err && (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading…
            </div>
          ) : data.posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No posts.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.posts.map((p) => (
                  <tr key={p.post_id}>
                    <td className="px-4 py-3 text-slate-500">{p.post_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {p.user_name || `User #${p.user_id}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.user_email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="max-w-sm truncate">
                        {p.post_desc || (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {p.post_type || "post"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {p.post_created_at
                        ? new Date(p.post_created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          disabled={busyId === p.post_id}
                          onClick={() => del(p.post_id)}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
