import React from 'react';
import { Clock, CheckCircle, ShoppingCart, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RecentActivity = ({ activities }) => {
    // Mock icons based on activity type
    const getIcon = (type) => {
        switch (type) {
            case 'purchase': return <ShoppingCart size={16} />;
            case 'upload': return <Upload size={16} />;
            case 'sale': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'purchase': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'upload': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'sale': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl h-full overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Clock className="mr-2 text-blue-400" size={20} />
                Live Activity Feed
                <span className="ml-2 flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-700/50">
                <AnimatePresence initial={false} mode='popLayout'>
                    {activities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            layout
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="relative pl-10 group"
                        >
                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 ${getColor(activity.type)}`}>
                                {getIcon(activity.type)}
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-gray-200 font-medium text-sm mb-1 flex items-center gap-2">
                                    {activity.message}
                                    {activity.emoji && (
                                        <span className="flex gap-1">
                                            {activity.emoji.split(' ').map((emoji, i) => (
                                                <motion.span
                                                    key={i}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                                >
                                                    {emoji}
                                                </motion.span>
                                            ))}
                                        </span>
                                    )}
                                </p>
                                <span className="text-xs text-gray-500">{activity.time}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activities.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent activity.</p>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
