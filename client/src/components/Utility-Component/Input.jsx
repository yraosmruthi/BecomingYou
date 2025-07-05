
const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
      )}
      <input
        className={`w-full px-4 py-3 ${
          Icon ? "pl-10" : ""
        } border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
          error ? "border-red-300 dark:border-red-500" : ""
        }`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

export default Input;
