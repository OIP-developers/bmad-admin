import { useEffect, useState } from "react";
import { AlertTriangle, Check, Trash2, UserX, FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { adminApi } from "../api/admin";

const POST_STATUSES = [
  { value: "pending",  label: "Pending",  tone: "bg-amber-100 text-amber-800" },
  { value: "reviewed", label: "Reviewed", tone: "bg-sky-100 text-sky-800" },
  { value: "removed",  label: "Removed",  tone: "bg-slate-200 text-slate-700" },
];

const USER_STATUSES = [
  { value: "pending",   label: "Pending",   tone: "bg-amber-100 text-amber-800" },
  { value: "reviewed",  label: "Reviewed",  tone: "bg-sky-100 text-sky-800" },
  { value: "dismissed", label: "Dismissed", tone: "bg-slate-200 text-slate-700" },
];

function StatusBadge({ value, statuses }) {
  const tone = statuses.find((s) => s.value === value)?.tone ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {value}
    </span>
  );
}

// ─── Post Reports Tab ─────────────────────────────────────────────────────────

function PostReports() {
  const [status, setStatus]   = useState("pending");
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [busyId, setBusyId]   = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    adminApi
      .listReports(status)
      .then((res) => { if (res.success) setRows(res.data); else setErr(res.msg || "Failed to load"); })
      .catch((e) => setErr(e.response?.data?.msg || e.message || "Network error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const markReviewed = async (id) => {
    setBusyId(id);
    try { await adminApi.updateReport(id, "reviewed"); load(); } finally { setBusyId(null); }
  };

  const removeContent = async (report_id, ban) => {
    if (!confirm(ban ? "Remove this post AND ban the author?" : "Remove this post?")) return;
    setBusyId(report_id);
    try { await adminApi.removeReportedContent(report_id, ban); load(); } finally { setBusyId(null); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {POST_STATUSES.map((s) => (
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

      {err && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No {status} post reports.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Post Author</th>
                <th className="px-4 py-3">Content</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      <span className="font-medium text-slate-900">#{r.id}</span>
                      <StatusBadge value={r.status} statuses={POST_STATUSES} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Reason: {r.reason}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{r.reporter_name || "—"}</div>
                    <div className="text-xs text-slate-500">{r.reporter_email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{r.author_name || "—"}</div>
                    <div className="text-xs text-slate-500">{r.author_email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="max-w-sm truncate">
                      {r.post_desc || <span className="text-slate-400">[deleted]</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── User Reports Tab ─────────────────────────────────────────────────────────

function UserReports() {
  const [status, setStatus]   = useState("pending");
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [busyId, setBusyId]   = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    adminApi
      .listUserReports(status)
      .then((res) => { if (res.success) setRows(res.data); else setErr(res.msg || "Failed to load"); })
      .catch((e) => setErr(e.response?.data?.msg || e.message || "Network error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = async (id) => {
    setBusyId(id);
    try { await adminApi.updateUserReport(id, "dismissed"); load(); } finally { setBusyId(null); }
  };

  const banUser = async (report_id, reported_name) => {
    if (!confirm(`Ban user "${reported_name}"? This will add them to the banned users list.`)) return;
    setBusyId(report_id);
    try {
      const res = await adminApi.banReportedUser(report_id);
      if (!res.success) setErr(res.msg || "Failed to ban user");
      load();
    } catch (e) {
      setErr(e.response?.data?.msg || e.message || "Network error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {USER_STATUSES.map((s) => (
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

      {err && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No {status} user reports.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Reported User</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      <span className="font-medium text-slate-900">#{r.id}</span>
                      <StatusBadge value={r.status} statuses={USER_STATUSES} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Reason: {r.reason}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{r.reporter_name || "—"}</div>
                    <div className="text-xs text-slate-500">{r.reporter_email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium">{r.reported_name || "—"}</div>
                    <div className="text-xs text-slate-500">{r.reported_email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {r.status === "pending" && (
                        <button
                          disabled={busyId === r.id}
                          onClick={() => dismiss(r.id)}
                          className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Check size={14} /> Dismiss
                        </button>
                      )}
                      {r.status !== "reviewed" && (
                        <button
                          disabled={busyId === r.id}
                          onClick={() => banUser(r.id, r.reported_name)}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          <UserX size={14} /> Ban User
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
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "posts", label: "Post Reports", icon: FileText },
  { key: "users", label: "User Reports", icon: UserX },
];

export default function Reports() {
  const [tab, setTab] = useState("posts");

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Review and action user-submitted reports"
      />

      <div className="p-8">
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                tab === key
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {tab === "posts" ? <PostReports /> : <UserReports />}
      </div>
    </>
  );
}
