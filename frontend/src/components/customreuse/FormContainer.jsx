// Form Container Component
export const FormContainer = ({ children, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            {children}
        </form>
    );
};
