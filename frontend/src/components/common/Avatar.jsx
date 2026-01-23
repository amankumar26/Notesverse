import React from 'react';

const Avatar = ({ src, name, size = "md", className = "" }) => {
    const sizeClasses = {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    };

    const dimensions = sizeClasses[size] || sizeClasses.md;

    // Generate a consistent seed from the name
    // We use 'notionists' style for a modern, abstract look that fits the app theme
    const seed = name ? encodeURIComponent(name) : "default";
    const fallbackUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;

    return (
        <div className={`${dimensions} rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-gray-800 ${className}`}>
            <img
                src={src || fallbackUrl}
                alt={name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackUrl;
                }}
            />
        </div>
    );
};

export default Avatar;
