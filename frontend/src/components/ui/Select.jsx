import React from 'react';

const Select = ({ id, label, options, value, onChange, required, error, className = '' }) => {
    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={id} className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <select
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                className={`
                    w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white 
                    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 outline-none transition-all duration-200
                    ${error ? 'border-red-500/50 focus:ring-red-500' : ''}
                    ${className}
                `}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Select;
