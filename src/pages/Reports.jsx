import { useEffect, useState } from "react";
import { AlertTriangle, Check, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { adminApi } from "../api/admin";

const STATUSES = [
  { value: "pending", label: "Pending", tone: "bg-amber-100 text-amber-800" },
  { value: "reviewed", label: "Reviewed", tone: "bg-sky-100 text-sky-800" },
  { value: "removed", label: "Removed", tone: "bg-slate-200 text-slate-700" },
];

export default function Reports() {
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    adminApi
      .listReports(status)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const markReviewed = async (id) => {
    setBusyId(id);
    try {
      await adminApi.updateReport(id, "reviewed");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const removeContent = async (report_id, ban) => {
    if (!confirm(ban ? "Remove this post AND ban the author?" : "Remove this post?"))
      return;
    setBusyId(report_id);
    try {
      await adminApi.removeReportedContent(report_id, ban);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="User-submitted reports of objectionable content"
      />

      <div className="p-8">
        <div className="mb-4 flex items-center gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                status === s.value
                  ? "border-rose-600 bg-rose-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>

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
              No {status} reports.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const tone = STATUSES.find((s) => s.value === r.status)?.tone;
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={16}
                            className="text-amber-500"
                          />
                          <span className="font-medium text-slate-900">
                            #{r.id}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Reason: {r.reason}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{r.reporter_name || "—"}</div>
                        <div className="text-xs text-slate-500">
                          {r.reporter_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{r.author_name || "—"}</div>
                        <div className="text-xs text-slate-500">
                          {r.author_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="max-w-sm truncate">
                          {r.post_desc || (
                            <span className="text-slate-400">[deleted]</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {r.status === "pending" && (
                            <button
                              disabled={busyId === r.id}
                              onClick={() => markReviewed(r.id)}
                              className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              <Check size={14} /> Mark OK
                            </button>
                          )}
                          {r.status !== "removed" && (
                            <button
                              disabled={busyId === r.id}
                              onClick={() => removeContent(r.id, true)}
                              className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              <Trash2 size={14} /> Remove + Ban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
