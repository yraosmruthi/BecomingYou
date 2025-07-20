import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  Mail,
  Lock,
  Phone,
  HelpCircle,
  Heart,
  ArrowLeft,
  Edit3,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const ProfileSettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    displayName: "John Doe",
    email: "john.doe@example.com",
    photoURL:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState({
    profile: false,
    email: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, photoURL: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (section) => {
    console.log(`Saving ${section} data:`, formData);
    setIsEditing((prev) => ({ ...prev, [section]: false }));
    // Here you would implement the actual save logic
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const sections = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "photo", label: "Profile Photo", icon: Camera },
    { id: "email", label: "Email Settings", icon: Mail },
    { id: "password", label: "Password", icon: Lock },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  const supportContacts = [
    {
      type: "Emergency",
      number: "+1 (555) 911-HELP",
      description: "24/7 Crisis Support",
    },
    {
      type: "General Support",
      number: "+1 (555) 123-CARE",
      description: "Mon-Fri 9AM-6PM EST",
    },
    {
      type: "Technical Help",
      number: "+1 (555) 456-TECH",
      description: "24/7 Technical Support",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Sidebar */}
            <div className="w-1/3 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Profile Settings
                </h2>
                <p className="text-purple-100">
                  Manage your account preferences
                </p>
              </div>

              <div className="space-y-2">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <img
                    src={formData.photoURL}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-3 border-white/30"
                  />
                  <p className="text-white font-medium">
                    {formData.displayName}
                  </p>
                  <p className="text-purple-200 text-sm">{formData.email}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeSection === "profile" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                          Profile Information
                        </h3>
                        <button
                          onClick={() =>
                            setIsEditing((prev) => ({
                              ...prev,
                              profile: !prev.profile,
                            }))
                          }
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>{isEditing.profile ? "Cancel" : "Edit"}</span>
                        </button>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Display Name
                            </label>
                            {isEditing.profile ? (
                              <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) =>
                                  handleInputChange(
                                    "displayName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <span className="text-gray-900 dark:text-white">
                                  {formData.displayName}
                                </span>
                              </div>
                            )}
                          </div>

                          {isEditing.profile && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="flex space-x-3 pt-4"
                            >
                              <button
                                onClick={() => handleSave("profile")}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              >
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "photo" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Profile Photo
                      </h3>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                        <div className="flex flex-col items-center space-y-6">
                          <div className="relative group">
                            <img
                              src={formData.photoURL}
                              alt="Profile"
                              className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg"
                            />
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer">
                                <Camera className="h-8 w-8 text-white" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="text-center space-y-2">
                            <p className="text-lg font-medium text-gray-800 dark:text-white">
                              Update Profile Picture
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Hover over your photo and click the camera icon to
                              upload a new image
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Supported formats: JPG, PNG, GIF (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "email" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                          Email Settings
                        </h3>
                        <button
                          onClick={() =>
                            setIsEditing((prev) => ({
                              ...prev,
                              email: !prev.email,
                            }))
                          }
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>{isEditing.email ? "Cancel" : "Edit"}</span>
                        </button>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Email Address
                            </label>
                            {isEditing.email ? (
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <span className="text-gray-900 dark:text-white">
                                  {formData.email}
                                </span>
                              </div>
                            )}
                          </div>

                          {isEditing.email && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-4"
                            >
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  📧 We'll send a verification email to confirm
                                  any changes to your email address.
                                </p>
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleSave("email")}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                  <Save className="h-4 w-4" />
                                  <span>Save Changes</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "password" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Change Password
                      </h3>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  showPassword.current ? "text" : "password"
                                }
                                value={formData.currentPassword}
                                onChange={(e) =>
                                  handleInputChange(
                                    "currentPassword",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  togglePasswordVisibility("current")
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword.current ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) =>
                                  handleInputChange(
                                    "newPassword",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility("new")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword.new ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  showPassword.confirm ? "text" : "password"
                                }
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                  handleInputChange(
                                    "confirmPassword",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  togglePasswordVisibility("confirm")
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword.confirm ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                              Password Requirements:
                            </h4>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                              <li>• At least 8 characters long</li>
                              <li>• Include uppercase and lowercase letters</li>
                              <li>• Include at least one number</li>
                              <li>• Include at least one special character</li>
                            </ul>
                          </div>

                          <button
                            onClick={() => handleSave("password")}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
                          >
                            <Lock className="h-4 w-4" />
                            <span>Update Password</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "support" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Support & Contact
                      </h3>

                      <div className="space-y-4">
                        {supportContacts.map((contact, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                  <Phone className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                  {contact.type}
                                </h4>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                  {contact.number}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {contact.description}
                                </p>
                              </div>
                              <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
                                Call Now
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <HelpCircle className="h-6 w-6" />
                          <h4 className="text-lg font-semibold">Need Help?</h4>
                        </div>
                        <p className="mb-4">
                          Our support team is here to help you on your wellness
                          journey. Don't hesitate to reach out if you need
                          assistance with your account, have questions about our
                          services, or need immediate support.
                        </p>
                        <div className="flex space-x-3">
                          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                            Live Chat
                          </button>
                          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                            Send Email
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
