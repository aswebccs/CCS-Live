// Loading Spinner Component
export const LoadingSpinner = ({ message = "Loading profile..." }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">{message}</p>
            </div>
        </div>
    );
};
