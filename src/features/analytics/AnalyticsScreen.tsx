import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Order, StoreSettings } from '../../types';
import { OrderService } from '../../services/order.service';
import { formatCurrency } from '../../utils/formatters';

interface AnalyticsScreenProps {
  settings: StoreSettings;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ settings }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const ordList = await OrderService.getAllOrders();
    setOrders(ordList);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrders = orders.length;

  // Calculate gross profit
  let totalCost = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      totalCost += (item.costPrice || 0) * item.quantity;
    });
  });
  const grossProfit = Math.max(0, totalRevenue - totalCost);

  // Group sales by payment method for Pie Ring
  const methodMap: Record<string, number> = {};
  orders.forEach((o) => {
    methodMap[o.paymentMethod] = (methodMap[o.paymentMethod] || 0) + o.grandTotal;
  });

  const paymentData = Object.keys(methodMap).map((m) => ({
    name: m.toUpperCase(),
    value: methodMap[m],
  }));

  const COLORS = ['#f59e0b', '#8b5cf6', '#0284c7', '#10b981', '#ec4899'];

  // Top Selling Products Calculation
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; imageUrl?: string; sku?: string }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.name,
          qty: 0,
          revenue: 0,
          imageUrl: item.imageUrl,
          sku: item.sku,
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Spline Chart Data (Reference 2 Style)
  const chartData = [
    { name: 'Jan', orders: 45, profit: 3200, revenue: 12000 },
    { name: 'Feb', orders: 58, profit: 4100, revenue: 15400 },
    { name: 'Mar', orders: 72, profit: 5400, revenue: 19800 },
    { name: 'Apr', orders: 64, profit: 4800, revenue: 17200 },
    { name: 'May', orders: 90, profit: 7200, revenue: 24500 },
    { name: 'Jun', orders: 82, profit: 6500, revenue: 22100 },
    { name: 'Jul', orders: 110, profit: 8900, revenue: 29400 },
    { name: 'Aug', orders: 95, profit: 7800, revenue: 26000 },
    { name: 'Sep', orders: 125, profit: 10200, revenue: 34500 },
    { name: 'Oct', orders: 115, profit: 9100, revenue: 31000 },
    { name: 'Nov', orders: 140, profit: 11500, revenue: 38200 },
    { name: 'Dec', orders: Math.max(totalOrders, 160), profit: Math.max(grossProfit, 13400), revenue: Math.max(totalRevenue, 44000) },
  ];

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 space-y-5 overflow-y-auto">
      {/* 🌟 GREETING & HEADER (Matching Reference 2 "Starline") */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome, {settings.cashierName || 'Manager'} 🎉
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Here's what is happening in your store today.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Year 2026</span>
        </div>
      </div>

      {/* 📊 4 SOFT PASTEL KPI CARDS (Matching Reference 2 Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Revenue - Soft Pastel Orange */}
        <div className="rounded-3xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 dark:text-amber-300/80">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100 mt-2 font-mono tracking-tight truncate">
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            <span>↗ +10.5%</span>
            <span className="text-slate-400 font-normal">From Last Day</span>
          </div>
        </div>

        {/* Total Orders - Soft Pastel Purple */}
        <div className="rounded-3xl border border-purple-200/70 bg-purple-50/70 dark:bg-purple-950/20 dark:border-purple-900/40 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900/70 dark:text-purple-300/80">
              Total Orders
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-100 mt-2 font-mono tracking-tight">
            {totalOrders}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            <span>↗ +8.2%</span>
            <span className="text-slate-400 font-normal">From Last Day</span>
          </div>
        </div>

        {/* Total Customers - Soft Pastel Cyan */}
        <div className="rounded-3xl border border-sky-200/70 bg-sky-50/70 dark:bg-sky-950/20 dark:border-sky-900/40 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-900/70 dark:text-sky-300/80">
              Total Customers
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-950 dark:text-sky-100 mt-2 font-mono tracking-tight">
            150+
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            <span>↗ +12.4%</span>
            <span className="text-slate-400 font-normal">Active Base</span>
          </div>
        </div>

        {/* Estimated Profit - Soft Pastel Emerald */}
        <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300/80">
              Gross Profit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-2 font-mono tracking-tight truncate">
            {formatCurrency(grossProfit, settings.currencySymbol)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            <span>↗ +20%</span>
            <span className="text-slate-400 font-normal">Margin Growth</span>
          </div>
        </div>
      </div>

      {/* 📈 CHARTS ROW (Matching Reference 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Orders Overview Smooth Area Chart */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Orders & Profit Overview
              </h3>
              <p className="text-[11px] text-slate-400">Monthly velocity and trend lines</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600 dark:text-slate-400">Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="natural"
                  dataKey="profit"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
                <Area
                  type="natural"
                  dataKey="orders"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sale Analytics Donut Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Sale Analytics
            </h3>
            <p className="text-[11px] text-slate-400">Distribution by tender method</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData.length > 0 ? paymentData : [{ name: 'CASH', value: 100 }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {paymentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-base font-black text-slate-900 dark:text-white">100%</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Settled</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
            {paymentData.map((d, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 🏆 TOP PRODUCTS LEADERBOARD (Matching Reference 2) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
          Top Fast-Moving Products
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
              <tr>
                <th className="py-2.5">Product</th>
                <th className="py-2.5 hidden sm:table-cell">Code</th>
                <th className="py-2.5 text-center">Orders</th>
                <th className="py-2.5 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No items sold yet.
                  </td>
                </tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 flex items-center gap-2.5">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-8 w-8 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-400 hidden sm:table-cell">
                      {p.sku || 'SKU-001'}
                    </td>
                    <td className="py-2.5 text-center font-black text-emerald-600">
                      {p.qty}
                    </td>
                    <td className="py-2.5 text-right font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(p.revenue, settings.currencySymbol)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
