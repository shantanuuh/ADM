import React from 'react';

const variants = {
    open: "bg-red-500/15 text-red-400 border border-red-500/10",
    resolved: "bg-green-500/15 text-green-400 border border-green-500/10",
    default: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/10"
};

const Badge = ({ status, className = '' }) => {
    const variantKey = status?.toLowerCase() || 'default';
    const style = variants[variantKey] || variants.default;

    return (
        <span className={`
            px-3 py-1 rounded-full text-xs font-medium inline-block tracking-wide
            ${style}
            ${className}
        `}>
            {status}
        </span>
    );
};

export default Badge;
