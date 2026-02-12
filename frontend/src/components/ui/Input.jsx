import React from 'react';

const Input = ({ label, id, className = '', error, icon: Icon, ...props }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    id={id}
                    className={`
                        w-full h-12 bg-white/50 border border-white/40 rounded-xl 
                        ${Icon ? 'pl-11 pr-5' : 'px-5'} 
                        text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200
                        focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300
                        focus:bg-white/70
                        ${error ? 'border-red-500/50 focus:ring-red-500' : ''}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export const TextArea = ({ label, id, className = '', error, ...props }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <textarea
                id={id}
                className={`
                    w-full bg-white/50 border border-white/40 rounded-xl px-5 py-4
                    text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300
                    focus:bg-white/70 resize-none
                    ${error ? 'border-red-500/50 focus:ring-red-500' : ''}
                `}
                {...props}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Input;
