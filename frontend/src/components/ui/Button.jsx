import React from 'react';

const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_25px_rgba(79,70,229,0.35)]",
    secondary: "bg-white/50 backdrop-blur-md border border-white/40 text-slate-700 hover:bg-white/80 hover:text-slate-900 hover:border-white/60",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-black/5",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.35)]"
};

const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-5 text-sm", // Standard "Mobile Elegance" size
    lg: "h-14 px-8 text-base font-bold",
    icon: "h-11 w-11 p-2 flex items-center justify-center"
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    type = 'button',
    disabled = false,
    ...props
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2 font-medium active:scale-95
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale pointer-events-none' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
