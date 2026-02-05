export function QuickInfoCard({ title, items }) {
    return (
        <div className="bg-white rounded-lg shadow border p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        {item.icon && (
                            <div className="flex-shrink-0 mt-0.5">
                                {item.icon}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                            <p className="text-sm text-gray-600 break-words">{item.value || "-"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
