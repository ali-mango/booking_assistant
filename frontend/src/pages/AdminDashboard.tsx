import { useState, useEffect } from "react";
import {
  getStats,
  getBookings,
  updateBookingStatus,
  getServices,
  createService,
  updateService,
  deleteService,
  getBusiness,
  updateBusiness,
} from "../services/adminApi";

type Tab = "dashboard" | "bookings" | "services" | "settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="flex h-screen bg-[#f8f9fb]">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">SmileCare</p>
              <p className="text-[10px] text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          {[
            { id: "dashboard" as Tab, label: "Dashboard", icon: "📊" },
            { id: "bookings" as Tab, label: "Bookings", icon: "📅" },
            { id: "services" as Tab, label: "Services", icon: "🦷" },
            { id: "settings" as Tab, label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all ${
                activeTab === item.id
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
          >
            ← Back to site
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "services" && <ServicesTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD TAB
// ============================================
function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    getStats().then(setStats);
    getBookings().then((data) => setRecentBookings(data.slice(0, 5)));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Bookings", value: stats?.today_bookings ?? "—", color: "from-teal-400 to-emerald-500" },
          { label: "Total Bookings", value: stats?.total_bookings ?? "—", color: "from-blue-400 to-indigo-500" },
          { label: "Confirmed", value: stats?.confirmed ?? "—", color: "from-green-400 to-emerald-500" },
          { label: "Cancelled", value: stats?.cancelled ?? "—", color: "from-orange-400 to-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Bookings</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {recentBookings.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">No bookings yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium">Date & Time</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b: any) => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{b.customer_name}</p>
                    <p className="text-xs text-gray-400">{b.customer_phone}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{b.services?.name ?? "—"}</td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{b.booking_date}</p>
                    <p className="text-xs text-gray-400">{b.start_time} - {b.end_time}</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={b.status} />
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

// ============================================
// BOOKINGS TAB
// ============================================
function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    const status = filter === "all" ? undefined : filter;
    const data = await getBookings(status);
    setBookings(data);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    await updateBookingStatus(bookingId, newStatus);
    loadBookings();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <div className="flex gap-2">
          {["all", "confirmed", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "text-gray-500 hover:bg-gray-100 border border-transparent"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">No bookings found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium">Date & Time</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any) => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{b.customer_name}</p>
                    <p className="text-xs text-gray-400">{b.customer_phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600">{b.services?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">₱{b.services?.price ?? "—"}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{b.booking_date}</p>
                    <p className="text-xs text-gray-400">{b.start_time} - {b.end_time}</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-4">
                    {b.status === "confirmed" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusChange(b.id, "completed")}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, "cancelled")}
                          className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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

// ============================================
// SERVICES TAB
// ============================================
function ServicesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", duration_minutes: 30, price: 0, description: "" });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  const handleSubmit = async () => {
    if (!form.name || form.price <= 0) return;

    if (editingId) {
      await updateService(editingId, form);
    } else {
      await createService(form);
    }

    setForm({ name: "", duration_minutes: 30, price: 0, description: "" });
    setShowForm(false);
    setEditingId(null);
    loadServices();
  };

  const handleEdit = (service: any) => {
    setForm({
      name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price,
      description: service.description || "",
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      await deleteService(id);
      loadServices();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button
          onClick={() => {
            setForm({ name: "", duration_minutes: 30, price: 0, description: "" });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
        >
          + Add Service
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Service" : "Add New Service"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Dental Checkup"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Price (₱)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
            >
              {editingId ? "Save Changes" : "Add Service"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      <div className="grid gap-3">
        {services.map((s: any) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between group hover:border-teal-100 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                s.is_active ? "bg-teal-50" : "bg-gray-100"
              }`}>
                🦷
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400">{s.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-teal-600">₱{Number(s.price).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{s.duration_minutes} min</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(s)}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SETTINGS TAB
// ============================================
function SettingsTab() {
  const [business, setBusiness] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    getBusiness().then(setBusiness);
  }, []);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    await updateBusiness({
      name: business.name,
      address: business.address,
      phone: business.phone,
      opening_time: business.opening_time,
      closing_time: business.closing_time,
      days_open: business.days_open,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleDay = (day: number) => {
    if (!business) return;
    const days = [...business.days_open.map(Number)];
    if (days.includes(day)) {
      setBusiness({ ...business, days_open: days.filter((d: number) => d !== day) });
    } else {
      setBusiness({ ...business, days_open: [...days, day].sort() });
    }
  };

  if (!business) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Business Settings</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Clinic Name</label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
            <input
              type="text"
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input
              type="text"
              value={business.phone}
              onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Opening Time</label>
              <input
                type="time"
                value={business.opening_time?.slice(0, 5)}
                onChange={(e) => setBusiness({ ...business, opening_time: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Closing Time</label>
              <input
                type="time"
                value={business.closing_time?.slice(0, 5)}
                onChange={(e) => setBusiness({ ...business, closing_time: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Open Days</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    business.days_open.map(Number).includes(day)
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-gray-50 text-gray-400 border border-gray-200"
                  }`}
                >
                  {dayNames[day]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATUS BADGE
// ============================================
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-50 text-green-600 border-green-100",
    completed: "bg-blue-50 text-blue-600 border-blue-100",
    cancelled: "bg-red-50 text-red-500 border-red-100",
    no_show: "bg-orange-50 text-orange-500 border-orange-100",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-md border font-medium ${styles[status] || "bg-gray-50 text-gray-500"}`}>
      {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
    </span>
  );
}