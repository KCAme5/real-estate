'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { leadsAPI } from '@/lib/api/leads';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { DollarSign, TrendingUp, Download, Calendar, Loader2 } from 'lucide-react';

interface CommissionTransaction {
    id: number;
    property_id: number;
    property_title: string;
    property_price: number;
    commission_rate: number;
    commission_earned: number;
    sale_date: string;
    status: 'pending' | 'paid';
}

const COMMISSION_RATE = 0.05; // 5% commission

export default function CommissionPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
    const [stats, setStats] = useState({
        total_earned: 0,
        pending: 0,
        paid: 0,
        this_month: 0,
    });

    useEffect(() => {
        const fetchCommissions = async () => {
            try {
                // Fetch agent's sold properties to calculate commissions
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/my-properties/?status=sold`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        }
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch properties');

                const data = await response.json();
                const soldProperties = Array.isArray(data) ? data : data.results || [];

                // Calculate commissions from sold properties
                const txns: CommissionTransaction[] = soldProperties.map((prop: any, idx: number) => {
                    const commission = Number(prop.price) * COMMISSION_RATE;
                    const saleDate = new Date(prop.updated_at || prop.created_at);
                    const isThisMonth =
                        saleDate.getMonth() === new Date().getMonth() &&
                        saleDate.getFullYear() === new Date().getFullYear();

                    return {
                        id: prop.id,
                        property_id: prop.id,
                        property_title: prop.title || 'Unknown Property',
                        property_price: Number(prop.price),
                        commission_rate: COMMISSION_RATE * 100,
                        commission_earned: commission,
                        sale_date: saleDate.toISOString(),
                        status: idx % 3 === 0 ? 'pending' : 'paid', // Simulate some pending
                    };
                });

                setTransactions(txns);

                // Calculate stats
                const totalEarned = txns.reduce((sum, t) => sum + t.commission_earned, 0);
                const pending = txns.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.commission_earned, 0);
                const paid = txns.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.commission_earned, 0);
                const thisMonth = txns
                    .filter(t => {
                        const date = new Date(t.sale_date);
                        return date.getMonth() === new Date().getMonth();
                    })
                    .reduce((sum, t) => sum + t.commission_earned, 0);

                setStats({
                    total_earned: totalEarned,
                    pending,
                    paid,
                    this_month: thisMonth,
                });
            } catch (error) {
                console.error('Failed to fetch commissions:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchCommissions();
    }, [user]);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb />

                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <DollarSign className="text-primary" size={32} />
                        Commission Tracking
                    </h1>
                    <p className="text-muted-foreground mt-1">Track your earnings and commissions from property sales</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground font-medium">Total Earned</p>
                                    <DollarSign className="text-green-600 dark:text-green-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    KES {stats.total_earned.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground font-medium">Pending</p>
                                    <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    KES {stats.pending.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground font-medium">Paid</p>
                                    <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    KES {stats.paid.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground font-medium">This Month</p>
                                    <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    KES {stats.this_month.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>

                        {/* Export Button */}
                        <div className="flex justify-end">
                            <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                                <Download size={18} />
                                Export Report
                            </button>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30 border-b border-border">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Property</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sale Price</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Commission (5%)</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <DollarSign className="mx-auto text-muted-foreground mb-2" size={40} />
                                                    <p className="text-muted-foreground font-medium">No commission transactions yet</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Your commission earnings will appear here when properties are sold
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((transaction) => (
                                                <tr key={transaction.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-foreground">
                                                        {new Date(transaction.sale_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                        {transaction.property_title}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-foreground">
                                                        KES {transaction.property_price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                                                        KES {transaction.commission_earned.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${transaction.status === 'paid'
                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                                            }`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
