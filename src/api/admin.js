import client from "./client";

export const adminApi = {
  login: (email, password) =>
    client.post("/admin/login", { email, password }).then((r) => r.data),

  me: () => client.get("/admin/me").then((r) => r.data),

  stats: () => client.get("/admin/stats").then((r) => r.data),

  // Users
  listUsers: (params = {}) =>
    client.get("/admin/users", { params }).then((r) => r.data),

  banUser: (user_id, reason) =>
    client.post("/admin/banUser", { user_id, reason }).then((r) => r.data),

  unbanUser: (user_id) =>
    client.post("/admin/unbanUser", { user_id }).then((r) => r.data),

  listBannedUsers: () =>
    client.get("/admin/bannedUsers").then((r) => r.data),

  // Posts
  listPosts: (params = {}) =>
    client.get("/admin/posts", { params }).then((r) => r.data),

  deletePost: (post_id) =>
    client.delete(`/admin/posts/${post_id}`).then((r) => r.data),

  // Reports
  listReports: (status) =>
    client
      .get("/admin/reports", { params: status ? { status } : {} })
      .then((r) => r.data),

  updateReport: (id, status) =>
    client.put(`/admin/reports/${id}`, { status }).then((r) => r.data),

  removeReportedContent: (report_id, ban_user = true) =>
    client
      .post("/admin/reports/remove", { report_id, ban_user })
      .then((r) => r.data),

  // User Reports
  listUserReports: (status) =>
    client
      .get("/admin/userReports", { params: status ? { status } : {} })
      .then((r) => r.data),

  updateUserReport: (id, status) =>
    client.put(`/admin/userReports/${id}`, { status }).then((r) => r.data),

  banReportedUser: (report_id) =>
    client.post("/admin/userReports/ban", { report_id }).then((r) => r.data),
};
