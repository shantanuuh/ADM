import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`
                bg-white/70 backdrop-blur-[16px]
                border border-white/40
                shadow-[0_8px_32px_rgba(0,0,0,0.1)]
                rounded-2xl
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
