import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, User, MessageSquare, Search } from 'lucide-react';

const QuickActions = () => {
    const actions = [
        {
            label: 'Upload Note',
            desc: 'Share your knowledge',
            icon: Upload,
            to: '/upload-note',
            color: 'from-blue-600 to-blue-400'
        },
        {
            label: 'Browse Notes',
            desc: 'Find study materials',
            icon: Search,
            to: '/listings',
            color: 'from-purple-600 to-purple-400'
        },
        {
            label: 'Check Messages',
            desc: 'Chat with buyers',
            icon: MessageSquare,
            to: '/chat',
            color: 'from-green-600 to-green-400'
        },
        {
            label: 'Edit Profile',
            desc: 'Update your info',
            icon: User,
            to: '/settings',
            color: 'from-orange-600 to-orange-400'
        }
    ];

    return (
        <div className="glass-panel p-6 rounded-xl h-full">
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.to}
                        className="group relative overflow-hidden rounded-xl p-4 bg-gray-800/50 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        <div className="relative z-10 flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                                <action.icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{action.label}</h4>
                                <p className="text-xs text-gray-400">{action.desc}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
