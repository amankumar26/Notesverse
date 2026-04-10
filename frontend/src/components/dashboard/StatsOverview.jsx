import React from 'react';
import { DollarSign, Upload, ShoppingBag, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsOverview = ({ stats }) => {
    const statItems = [
        {
            label: 'Total Revenue',
            value: stats.totalEarnings || '₹0',
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            trend: '+12.5%'
        },
        {
            label: 'Notes Uploaded',
            value: stats.notesUploaded || '0',
            icon: Upload,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            trend: '+4'
        },
        {
            label: 'Purchases',
            value: stats.notesPurchased || '0',
            icon: ShoppingBag,
            color: 'text-indigo-400',
            bg: 'bg-indigo-400/10',
            trend: '+1'
        },
        {
            label: 'Engagement',
            value: stats.profileViews || '0',
            icon: TrendingUp,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            trend: '+89'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statItems.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className={`p-2.5 rounded-xl ${item.bg}`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={10} />
                            {item.trend}
                        </div>
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-2xl font-display font-bold text-white mb-0.5">{item.value}</h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default StatsOverview;

