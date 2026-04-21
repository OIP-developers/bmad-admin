import { useEffect, useState } from "react";
import { Flag, FileText, MessageSquare, Users, UserX } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { adminApi } from "../api/admin";

const StatCard = ({ label, value, icon: Icon, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-50 text-slate-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {value ?? "—"}
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .stats()
      .then((res) => {
        if (res.success) setStats(res.data);
        else setError(res.msg || "Failed to load stats");
      })
      .catch((err) =>
        setError(err.response?.data?.msg || err.message || "Network error")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of BMAD moderation activity"
      />
      <div className="p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Pending reports"
            value={loading ? null : stats?.pending_reports}
            icon={Flag}
            tone="rose"
          />
          <StatCard
            label="Total reports"
            value={loading ? null : stats?.total_reports}
            icon={Flag}
            tone="amber"
          />
          <StatCard
            label="Banned users"
            value={loading ? null : stats?.banned_users}
            icon={UserX}
            tone="rose"
          />
          <StatCard
            label="Total users"
            value={loading ? null : stats?.total_users}
            icon={Users}
            tone="sky"
          />
          <StatCard
            label="Total posts"
            value={loading ? null : stats?.total_posts}
            icon={FileText}
            tone="emerald"
          />
          <StatCard
            label="Total comments"
            value={loading ? null : stats?.total_comments}
            icon={MessageSquare}
            tone="slate"
          />
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Quick reminders
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>
              Apple requires action on reports within <strong>24 hours</strong>.
            </li>
            <li>
              Removing content automatically bans the author by default.
            </li>
            <li>
              Unban a user from the Banned Users tab if a ban was a mistake.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
