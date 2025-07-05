import React, { useState } from "react";
import { User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import Button from "../Utility-Component/Button";
import Input from "../Utility-Component/Input";
import { useAuth } from "../../auth/auth-context";

const SignupForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const { signUp, loading, error } = useAuth();

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!passwordValidation.isValid && formData.password) {
      newErrors.password = "Password must meet all requirements";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.name
      );
      if (result.success) {
        setSuccessMessage(result.message);
        // Reset form
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
        });
        if (onSuccess) {
          onSuccess(result.user);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-300">
            {error}
          </span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-300">
            {successMessage}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Enter your full name"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          icon={User}
          placeholder="Enter your email"
        />

        <div className="space-y-2">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {formData.password && (
            <div className="text-xs space-y-1">
              <p className="text-gray-600 dark:text-gray-400">
                Password requirements:
              </p>
              <div className="grid grid-cols-2 gap-1">
                <div
                  className={`flex items-center space-x-1 ${
                    passwordValidation.minLength
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      passwordValidation.minLength
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span>6+ characters</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${
                    passwordValidation.hasUpperCase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      passwordValidation.hasUpperCase
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span>Uppercase</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${
                    passwordValidation.hasLowerCase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      passwordValidation.hasLowerCase
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span>Lowercase</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${
                    passwordValidation.hasNumbers
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      passwordValidation.hasNumbers
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span>Number</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
};

export default SignupForm;
