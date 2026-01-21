/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxIconLine } from "../../icons";
import { useState, useEffect } from "react";
import { getDashboardApi } from "../../api/dashboardAPI";
import toast from "react-hot-toast";
import { MdOutlineCategory } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { LuPalette } from "react-icons/lu";
import { BsCalendar4Event } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import { FaWpforms } from "react-icons/fa6";

type DashboardStats = {
  artists: number;
  categories: number;
  artTypes: number;
  events: number;
  contributions: number;
  applications: {
    artForms: number;
    events: number;
  };
};

export default function EcommerceMetrics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardApi();
      setStats(res.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const metrics = stats
    ? [
        {
          label: "Total Artists",
          value: stats.artists,
          icon: <MdOutlineDashboard  className="w-8 h-8" />,
          color: "#893128",
          bgColor: "bg-[#893128]",
          iconColor: "text-white",
        },
        {
          label: "Total Categories",
          value: stats.categories,
          icon: <MdOutlineCategory  className="w-8 h-8" />,
          color: "#893128",
          bgColor: "bg-[#893128]",
          iconColor: "text-white",
        },
        {
          label: "Total Art Types",
          value: stats.artTypes,
          icon: <LuPalette className="w-8 h-8" />,
          color: "#893128",
          bgColor: "bg-[#893128]",
          iconColor: "text-white",
        },
        {
          label: "Total Events",
          value: stats.events,
          icon: <BsCalendar4Event className="w-8 h-8" />,
          color: "#893128",
          bgColor: "bg-[#893128]",
          iconColor: "text-white",
        },
        {
          label: "Total Contributions",
          value: stats.contributions,
          icon: <HiOutlineUsers  className="w-8 h-8" />,
          color: "#893128",
          bgColor: "bg-[#893128]",
          iconColor: "text-white",
        },
        {
          label: "Registrations",
          value: stats.applications,
          icon: <FaWpforms className="w-8 h-8" />,
          color: "#893128",
          bgColor: "bg-[#893128]",
          iconColor: "text-white",
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Monitor your platform's key metrics at a glance
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        )}

        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}>
                <div
                  className={"h-2"}
                  style={{ background: metric.color }}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${metric.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className={metric.iconColor}>{metric.icon}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {metric.label}
                      </p>
                      {metric.label === "Registrations" ? (
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-left">
                            <p className="text-xs text-gray-500">Art Form</p>
                            <p className="text-2xl font-bold text-amber-900">
                              {stats.applications.artForms}
                            </p>
                          </div>

                          <div className="h-10 w-[1px] bg-gray-200 mx-4"></div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">Events</p>
                            <p className="text-2xl font-bold text-amber-900">
                              {stats.applications.events}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-amber-900">
                          {Number(metric.value || 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={loadDashboard}
                      className="text-amber-900 font-medium transition-colors">
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !stats && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BoxIconLine className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">No data available</p>
            <button
              onClick={loadDashboard}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
              Retry
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
