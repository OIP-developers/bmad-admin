import { useEffect, useState } from "react";
import { Ban, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { adminApi } from "../api/admin";

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    adminApi
      .listUsers({ page, limit: 25, search })
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

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const banUser = async (user_id, user_name) => {
    const reason = prompt(`Reason for banning ${user_name}?`, "Manual ban");
    if (reason === null) return;
    setBusyId(user_id);
    try {
      const res = await adminApi.banUser(user_id, reason || "Manual ban");
      if (!res.success) alert(res.msg);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const unbanUser = async (user_id) => {
    if (!confirm("Unban this user?")) return;
    setBusyId(user_id);
    try {
      await adminApi.unbanUser(user_id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / 25));

  return (
    <>
      <PageHeader title="Users" subtitle={`${data.total || 0} total users`} />

      <div className="p-8">
        <form onSubmit={onSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Search
          </button>
        </form>

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
          ) : data.users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.users.map((u) => (
                  <tr key={u.user_id}>
                    <td className="px-4 py-3 text-slate-500">{u.user_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {u.user_name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{u.user_email}</td>
                    <td className="px-4 py-3">
                      {u.is_banned ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
                          Banned
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {u.is_banned ? (
                          <button
                            disabled={busyId === u.user_id}
                            onClick={() => unbanUser(u.user_id)}
                            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            disabled={busyId === u.user_id}
                            onClick={() =>
                              banUser(u.user_id, u.user_name)
                            }
                            className="flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <Ban size={12} /> Ban
                          </button>
                        )}
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
