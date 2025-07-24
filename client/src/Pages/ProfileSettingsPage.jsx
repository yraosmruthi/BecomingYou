import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
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
  Plus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Shield,
  Settings,
} from "lucide-react";

const ProfileSettingsPage = () => {
  const auth = getAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    photoURL: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState({
    profile: false,
    email: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Support-specific state
  const [supportData, setSupportData] = useState({
    emergencyContact: "",
    preferredSupportType: "AI only",
    notes: "",
    emergencyNumbers: [],
    showDefaultContacts: true,
    crisisSettings: {
      allowCrisisDetection: true,
      autoContactEmergency: false,
      crisisKeywords: [],
    },
  });


  const [newEmergencyNumber, setNewEmergencyNumber] = useState({
    type: "",
    number: "",
    description: "",
  });

  const [showAddEmergencyForm, setShowAddEmergencyForm] = useState(false);

  const [defaultSupportContacts] = useState([
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
  ]);

  // API Base URL - adjust according to your backend
  const API_BASE_URL =
    "http://localhost:3000/api";

  // Get auth token from Firebase (assuming you have this function)
  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };


  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          displayName: data.data.displayName || "",
          email: data.data.email || "",
          photoURL:
            data.data.photoURL ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        if (data.data.privacySettings) {
          setPrivacySettings(data.data.privacySettings);
        }
      }
    } catch (error) {
      showMessage("error", "Failed to load profile data");
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportData = async () => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/profile/support`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setSupportData(data.data);
      }
    } catch (error) {
      showMessage("error", "Failed to load support settings");
      console.error("Error loading support data:", error);
    }
  };

  // Load support data when support section is active
  useEffect(() => {
    if (activeSection === "support") {
      loadSupportData();
    }
  }, [activeSection]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, photoURL: e.target.result }));
        updatePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // const updatePhoto = async (photoURL) => {
  //   try {
  //     const token = await getAuthToken();

  //     const response = await fetch(`${API_BASE_URL}/profile/photo`, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ photoURL }),
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       showMessage("success", "Profile photo updated successfully");
  //     } else {
  //       showMessage("error", data.message || "Failed to update photo");
  //     }
  //   } catch (error) {
  //     showMessage("error", "Failed to update profile photo");
  //     console.error("Error updating photo:", error);
  //   }
  // };

  const handleSave = async (section) => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      let endpoint = `${API_BASE_URL}/profile/update`;
      let body = {};

      if (section === "profile") {
        body = { displayName: formData.displayName };
      } else if (section === "email") {
        endpoint = `${API_BASE_URL}/profile/email`;
        body = { email: formData.email };
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        showMessage(
          "success",
          data.message || `${section} updated successfully`
        );
        setIsEditing((prev) => ({ ...prev, [section]: false }));
      } else {
        showMessage("error", data.message || `Failed to update ${section}`);
      }
    } catch (error) {
      showMessage("error", `Failed to update ${section}`);
      console.error(`Error updating ${section}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      return;
    }

    showMessage("success", "Password change would be handled by Firebase Auth");
    // In a real app, you'd handle this with Firebase Auth
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  

  const handleSupportUpdate = async (field, value) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/profile/support`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (data.success) {
        setSupportData(data.data);
        showMessage("success", "Support settings updated");
      } else {
        showMessage(
          "error",
          data.message || "Failed to update support settings"
        );
      }
    } catch (error) {
      showMessage("error", "Failed to update support settings");
      console.error("Error updating support:", error);
    }
  };

  const handleAddEmergencyNumber = async () => {
    if (!newEmergencyNumber.type.trim() || !newEmergencyNumber.number.trim()) {
      showMessage("error", "Please fill in contact type and number");
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/profile/support/emergency-number`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEmergencyNumber),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSupportData(data.data);
        setNewEmergencyNumber({ type: "", number: "", description: "" });
        setShowAddEmergencyForm(false);
        showMessage("success", "Emergency contact added successfully");
      } else {
        showMessage("error", data.message || "Failed to add emergency contact");
      }
    } catch (error) {
      showMessage("error", "Failed to add emergency contact");
      console.error("Error adding emergency contact:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmergencyNumber = async (numberId) => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/profile/support/emergency-number/${numberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSupportData(data.data);
        showMessage("success", "Emergency contact removed");
      } else {
        showMessage(
          "error",
          data.message || "Failed to remove emergency contact"
        );
      }
    } catch (error) {
      showMessage("error", "Failed to remove emergency contact");
      console.error("Error removing emergency contact:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const sections = [
    { id: "profile", label: "Profile Info", icon: User },
    // { id: "photo", label: "Profile Photo", icon: Camera },
    { id: "email", label: "Email Settings", icon: Mail },
    { id: "password", label: "Password", icon: Lock },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Profile Information
        </h3>
        <button
          onClick={() => {
            if (isEditing.profile) {
              handleSave("profile");
            } else {
              setIsEditing((prev) => ({ ...prev, profile: true }));
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          {isEditing.profile ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit3 className="h-4 w-4" />
          )}
          <span>{isEditing.profile ? "Save" : "Edit"}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange("displayName", e.target.value)}
            disabled={!isEditing.profile}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );

  // const renderPhotoSection = () => (
  //   <div className="space-y-6">
  //     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
  //       Profile Photo
  //     </h3>

  //     <div className="flex items-center space-x-6">
  //       <div className="relative">
  //         <img
  //           src={formData.photoURL}
  //           alt="Profile"
  //           className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 dark:border-purple-800"
  //         />
  //         <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition-colors">
  //           <Camera className="h-4 w-4" />
  //           <input
  //             type="file"
  //             accept="image/*"
  //             onChange={handlePhotoUpload}
  //             className="hidden"
  //           />
  //         </label>
  //       </div>

  //       <div>
  //         <p className="text-gray-600 dark:text-gray-400 mb-2">
  //           Click the camera icon to upload a new photo
  //         </p>
  //         <p className="text-sm text-gray-500 dark:text-gray-500">
  //           Recommended: Square image, at least 200x200 pixels
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderEmailSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Email Settings
        </h3>
        <button
          onClick={() => {
            if (isEditing.email) {
              handleSave("email");
            } else {
              setIsEditing((prev) => ({ ...prev, email: true }));
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          {isEditing.email ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit3 className="h-4 w-4" />
          )}
          <span>{isEditing.email ? "Save" : "Edit"}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={!isEditing.email}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderPasswordSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Change Password
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPassword.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                handleInputChange("currentPassword", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
              type={showPassword.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword.confirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Update Password
        </button>
      </div>
    </div>
  );

  
  const renderSupportSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Support Settings
      </h3>

      {/* Support Type Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Support Type
          </label>
          <select
            value={supportData.preferredSupportType}
            onChange={(e) =>
              handleSupportUpdate("preferredSupportType", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="AI only">AI Support Only</option>
            <option value="AI + human">AI + Human Support</option>
            <option value="human only">Human Support Only</option>
            <option value="crisis hotline">Crisis Hotline</option>
          </select>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emergency Contact
          </label>
          <input
            type="text"
            value={supportData.emergencyContact || ""}
            onChange={(e) =>
              handleSupportUpdate("emergencyContact", e.target.value)
            }
            placeholder="Primary emergency contact"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            value={supportData.notes || ""}
            onChange={(e) => handleSupportUpdate("notes", e.target.value)}
            placeholder="Any additional information for support staff..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Emergency Numbers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">
            Emergency Numbers
          </h4>
          <button
            onClick={() => setShowAddEmergencyForm(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Number</span>
          </button>
        </div>

        {/* Default Support Contacts */}
        {supportData.showDefaultContacts && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Default Support Contacts
            </h5>
            <div className="space-y-2">
              {defaultSupportContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {contact.type}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {contact.number}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {contact.description}
                    </p>
                  </div>
                  <Phone className="h-5 w-5 text-blue-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Emergency Numbers */}
        {supportData.emergencyNumbers &&
          supportData.emergencyNumbers.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Your Emergency Contacts
              </h5>
              <div className="space-y-2">
                {supportData.emergencyNumbers.map((contact, index) => (
                  <div
                    key={contact._id || index}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">
                        {contact.type}
                      </p>
                      <p className="text-red-700 dark:text-red-300">
                        {contact.number}
                      </p>
                      {contact.description && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {contact.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveEmergencyNumber(contact._id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Add Emergency Number Form */}
        <AnimatePresence>
          {showAddEmergencyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Add Emergency Contact
                </h5>
                <button
                  onClick={() => {
                    setShowAddEmergencyForm(false);
                    setNewEmergencyNumber({
                      type: "",
                      number: "",
                      description: "",
                    });
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Type *
                  </label>
                  <input
                    type="text"
                    value={newEmergencyNumber.type}
                    onChange={(e) =>
                      setNewEmergencyNumber((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    placeholder="e.g., Family, Doctor, Therapist"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newEmergencyNumber.number}
                    onChange={(e) =>
                      setNewEmergencyNumber((prev) => ({
                        ...prev,
                        number: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newEmergencyNumber.description}
                    onChange={(e) =>
                      setNewEmergencyNumber((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="When to contact, availability, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setShowAddEmergencyForm(false);
                      setNewEmergencyNumber({
                        type: "",
                        number: "",
                        description: "",
                      });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmergencyNumber}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Add Contact
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Crisis Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Crisis Detection Settings
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Crisis Detection
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow AI to detect crisis situations
              </p>
            </div>
            <button
              onClick={() => {
                const newSettings = {
                  ...supportData.crisisSettings,
                  allowCrisisDetection:
                    !supportData.crisisSettings?.allowCrisisDetection,
                };
                handleSupportUpdate("crisisSettings", newSettings);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                supportData.crisisSettings?.allowCrisisDetection
                  ? "bg-purple-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  supportData.crisisSettings?.allowCrisisDetection
                    ? "translate-x-6"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Auto-Contact Emergency
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically contact emergency services in crisis
              </p>
            </div>
            <button
              onClick={() => {
                const newSettings = {
                  ...supportData.crisisSettings,
                  autoContactEmergency:
                    !supportData.crisisSettings?.autoContactEmergency,
                };
                handleSupportUpdate("crisisSettings", newSettings);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                supportData.crisisSettings?.autoContactEmergency
                  ? "bg-red-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  supportData.crisisSettings?.autoContactEmergency
                    ? "translate-x-6"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      // case "photo":
      //   return renderPhotoSection();
      case "email":
        return renderEmailSection();
      case "password":
        return renderPasswordSection();
      case "privacy":
        return renderPrivacySection();
      case "support":
        return renderSupportSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}

      {/* Message notification */}
      {message.text && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
          </div>
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
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                        : "text-purple-100 hover:bg-white/10 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* User Info in Sidebar */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={formData.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-white/30"
                  /> */}
                  <div>
                    <p className="text-white font-medium">
                      {formData.displayName || "User"}
                    </p>
                    <p className="text-purple-100 text-sm">{formData.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
