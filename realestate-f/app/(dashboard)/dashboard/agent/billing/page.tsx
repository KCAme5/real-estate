'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { paymentsAPI, PaymentPlan, AgentSubscription, MpesaTransaction } from '@/lib/api/payments';

type Tab = 'overview' | 'plans' | 'transactions';

export default function AgentBillingPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<AgentSubscription | null>(null);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, txRes] = await Promise.all([
        paymentsAPI.getAgentSubscription(),
        paymentsAPI.getPaymentPlans(),
        paymentsAPI.getMpesaTransactions(),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data);
      setTransactions(txRes.data);
    } catch (error: any) {
      console.error('Failed to load billing data:', error);
      // Use demo data for development
      setSubscription({
        id: 1,
        agent: 1,
        plan: 1,
        plan_name: 'Basic Plan',
        plan_features: ['5 property listings', 'Email support', 'Basic analytics'],
        status: 'active',
        start_date: '2026-03-01T00:00:00Z',
        end_date: '2026-03-31T00:00:00Z',
        auto_renew: true,
        properties_listed: 3,
        properties_featured: 0,
        days_remaining: 25,
        created_at: '2026-03-01T00:00:00Z',
      });
      setPlans([
        {
          id: 1,
          name: 'Basic Plan',
          plan_type: 'basic',
          price_kes: '5000.00',
          price_usd: '45.00',
          description: 'Perfect for starting agents',
          features: ['5 property listings', 'Email support', 'Basic analytics'],
          property_listings: 5,
          featured_days: 0,
          validity_days: 30,
          is_active: true,
          created_at: '2026-03-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Premium Plan',
          plan_type: 'premium',
          price_kes: '15000.00',
          price_usd: '135.00',
          description: 'For established agents',
          features: ['25 property listings', 'Priority support', 'Advanced analytics', 'Featured listings'],
          property_listings: 25,
          featured_days: 7,
          validity_days: 30,
          is_active: true,
          created_at: '2026-03-01T00:00:00Z',
        },
        {
          id: 3,
          name: 'Enterprise Plan',
          plan_type: 'enterprise',
          price_kes: '35000.00',
          price_usd: '315.00',
          description: 'For agencies and teams',
          features: ['Unlimited listings', 'Dedicated support', 'Full analytics', 'Unlimited featured', 'API access'],
          property_listings: -1,
          featured_days: 30,
          validity_days: 30,
          is_active: true,
          created_at: '2026-03-01T00:00:00Z',
        },
      ]);
      setTransactions([]);
      toast.warning('Demo Mode', 'Using sample billing data');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!phoneNumber || !selectedPlan) return;
    
    setPaymentProcessing(true);
    try {
      const response = await paymentsAPI.initiateMpesaPayment({
        phone_number: phoneNumber,
        amount: selectedPlan.price_kes,
        transaction_type: 'subscription',
        account_reference: `KP-${selectedPlan.plan_type.toUpperCase()}-${user?.id}`,
        description: `${selectedPlan.name} Subscription`,
      });
      
      if (response.data.success) {
        toast.success('Payment Initiated', 'Check your phone for M-Pesa prompt');
        setShowPaymentModal(false);
        setPhoneNumber('');
        loadBillingData();
      }
    } catch (error: any) {
      toast.error('Payment Failed', error.message || 'Failed to initiate payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'expired': return 'text-red-400 bg-red-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string) => {
    return `KES ${parseFloat(amount).toLocaleString('en-KE')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Billing & Subscription</h1>
          <p className="text-slate-400 font-medium mt-1">Manage your subscription and payment history</p>
        </div>
        <button
          onClick={loadBillingData}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 lg:p-8 border border-slate-700/50 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{subscription?.plan_name || 'No Active Plan'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(subscription?.status || 'active')}`}>
                  {subscription?.status || 'inactive'}
                </span>
                {subscription?.auto_renew && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <RefreshCw size={12} />
                    Auto-Renew
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{subscription?.days_remaining || 0}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Days Left</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">{subscription?.properties_listed || 0}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blue-400">{subscription?.properties_featured || 0}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Featured</p>
            </div>
            <button
              onClick={() => { setSelectedPlan(plans.find(p => p.id !== subscription?.plan) || plans[1]); setShowPaymentModal(true); }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all shadow-xl shadow-blue-600/20"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
        
        {subscription && (
          <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap gap-x-8 gap-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-slate-500" />
              <span className="text-slate-400">Renews:</span>
              <span className="text-white font-semibold">{formatDate(subscription.end_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={14} className="text-slate-500" />
              <span className="text-slate-400">Price:</span>
              <span className="text-white font-semibold">KES {plans.find(p => p.id === subscription?.plan)?.price_kes || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50 w-fit">
        {(['overview', 'plans', 'transactions'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">Usage This Month</h3>
            </div>
            <p className="text-4xl font-black text-white">{subscription?.properties_listed || 0}</p>
            <p className="text-sm text-slate-500 mt-1">
              of {plans.find(p => p.id === subscription?.plan)?.property_listings || '?'} listings used
            </p>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                style={{
                  width: `${Math.min(100, ((subscription?.properties_listed || 0) / (plans.find(p => p.id === subscription?.plan)?.property_listings || 1)) * 100)}%`
                }}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white">Time Remaining</h3>
            </div>
            <p className="text-4xl font-black text-white">{subscription?.days_remaining || 0}</p>
            <p className="text-sm text-slate-500 mt-1">days until renewal</p>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white">Plan Benefits</h3>
            </div>
            <ul className="space-y-2">
              {subscription?.plan_features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-900/50 rounded-3xl p-6 border transition-all ${
                subscription?.plan === plan.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-800/50 hover:border-slate-700'
              }`}
            >
              {subscription?.plan === plan.id && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-xs font-bold text-white">
                  Current Plan
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-white">{plan.name}</h3>
                <p className="text-4xl font-black text-white mt-2">
                  {formatCurrency(plan.price_kes)}
                  <span className="text-sm text-slate-500 font-normal">/mo</span>
                </p>
                <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-slate-300">
                    {plan.property_listings === -1 ? 'Unlimited' : plan.property_listings} listings
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-slate-300">
                    {plan.featured_days === 0 ? 'No' : plan.featured_days} featured listings
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-slate-300">{plan.validity_days} days validity</span>
                </li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { setSelectedPlan(plan); setShowPaymentModal(true); }}
                disabled={subscription?.plan === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  subscription?.plan === plan.id
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20'
                }`}
              >
                {subscription?.plan === plan.id ? 'Current Plan' : plan.price_kes > (plans.find(p => p.id === subscription?.plan)?.price_kes || '0') ? 'Upgrade' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Transactions Yet</h3>
              <p className="text-slate-400">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium capitalize">
                        {tx.transaction_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {tx.mpesa_receipt_number || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-slate-800/50 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">Complete Payment</h2>
            <p className="text-slate-400 mb-6">
              Subscribe to <span className="text-white font-bold">{selectedPlan.name}</span> for {formatCurrency(selectedPlan.price_kes)}/month
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-bold">{formatCurrency(selectedPlan.price_kes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white font-medium">{selectedPlan.validity_days} days</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ShieldCheck size={16} className="text-emerald-400" />
                Secure M-Pesa payment
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={initiatePayment}
                disabled={paymentProcessing || !phoneNumber}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {formatCurrency(selectedPlan.price_kes)}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}