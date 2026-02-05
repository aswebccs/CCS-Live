// Reusable Item Card Component
export const ItemCard = ({ icon, title, subtitle, period, description, link, onDelete, isDeleting = false, colorScheme = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green: "bg-green-50 text-green-600 border-green-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        red: "bg-red-50 text-red-600 border-red-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };

    return (
        <div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${colorClasses[colorScheme]}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                {subtitle && <p className="text-gray-700 text-sm mt-0.5">{subtitle}</p>}
                {period && <p className="text-gray-500 text-xs mt-1">{period}</p>}
                {description && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{description}</p>}
                {link && (
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                    >
                        {link.text}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
            {onDelete && (
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 h-fit disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete"
                >
                    {isDeleting ? (
                        <svg className="animate-spin w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};
