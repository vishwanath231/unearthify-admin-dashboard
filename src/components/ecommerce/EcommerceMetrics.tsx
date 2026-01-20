/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxIconLine, GroupIcon } from "../../icons";
import { useState, useEffect } from "react";
import { getDashboardApi } from "../../api/dashboardAPI";
import toast from "react-hot-toast";

type DashboardStats = {
  artists: number;
  categories: number;
  artTypes: number;
  events: number;
  contributions: number;
  applications: number;
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

  const metrics = stats ? [
    {
      label: "Total Artists",
      value: stats.artists,
      icon: <GroupIcon className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      label: "Total Categories",
      value: stats.categories,
      icon: <BoxIconLine className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      label: "Total Art Types",
      value: stats.artTypes,
      icon: <BoxIconLine className="w-8 h-8" />,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    },
    {
      label: "Total Events",
      value: stats.events,
      icon: <BoxIconLine className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      label: "Total Contributions",
      value: stats.contributions,
      icon: <GroupIcon className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      label: "Total Registrations",
      value: stats.applications,
      icon: <GroupIcon className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    }
  ] : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your platform's key metrics at a glance</p>
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
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`h-2 bg-gradient-to-r ${metric.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${metric.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className={metric.iconColor}>
                        {metric.icon}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 mb-1">{metric.label}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                        {Number(metric.value || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Updated just now</span>
                      <button 
                        onClick={loadDashboard}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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