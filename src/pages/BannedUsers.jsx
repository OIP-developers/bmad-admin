import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { adminApi } from "../api/admin";

export default function BannedUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listBannedUsers()
      .then((res) => {
        if (res.success) setRows(res.data);
        else setErr(res.msg || "Failed to load");
      })
      .catch((e) =>
        setErr(e.response?.data?.msg || e.message || "Network error")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const unban = async (user_id) => {
    if (!confirm("Unban this user? They will be able to sign in again."))
      return;
    setBusyId(user_id);
    try {
      await adminApi.unbanUser(user_id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Banned users"
        subtitle={`${rows.length} user${rows.length === 1 ? "" : "s"} currently banned`}
      />

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
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No banned users.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Banned by</th>
                  <th className="px-4 py-3">Banned at</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {b.user_name || `User #${b.user_id}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.user_email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{b.reason}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {b.banned_by ? `Admin #${b.banned_by}` : "System"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(b.banned_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          disabled={busyId === b.user_id}
                          onClick={() => unban(b.user_id)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Unban
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
