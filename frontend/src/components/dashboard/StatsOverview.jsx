import React from 'react';
import { DollarSign, Upload, ShoppingBag, TrendingUp } from 'lucide-react';

const StatsOverview = ({ stats }) => {
    const statItems = [
        {
            label: 'Total Earnings',
            value: stats.totalEarnings || '$0.00',
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            label: 'Notes Uploaded',
            value: stats.notesUploaded || '0',
            icon: Upload,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Notes Purchased',
            value: stats.notesPurchased || '0',
            icon: ShoppingBag,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            label: 'Profile Views',
            value: stats.profileViews || '0',
            icon: TrendingUp,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statItems.map((item, index) => (
                <div
                    key={index}
                    className="glass-panel p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${item.bg} ${item.border} border`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{item.value}</h3>
                    <p className="text-sm text-gray-400">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;
