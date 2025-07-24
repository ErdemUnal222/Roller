import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import api from '../../api/axios';
import '/src/styles/main.scss';

/**
 * Profile Component
 * This component allows the logged-in user to:
 * - View their profile information
 * - Edit and update profile fields
 * - Upload or change their profile picture
 * It syncs with the Redux store and interacts with the backend.
 */
const Profile = () => {
  const dispatch = useDispatch(); // Used to update user info in the global Redux state

  // Local state to hold profile data and form behavior
  const [profile, setProfile] = useState(null);       // User profile data
  const [loading, setLoading] = useState(true);       // Controls loading state on mount
  const [editing, setEditing] = useState(false);      // Indicates if the form is in "edit mode"
  const [saving, setSaving] = useState(false);        // Indicates if the form is being submitted
  const [message, setMessage] = useState('');         // Status message (success or error)
  const [selectedFile, setSelectedFile] = useState(null); // Holds the selected file for upload

  /**
   * useEffect to fetch user profile when the component loads.
   * Sends a GET request to /me and saves the result in state and Redux.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/me'); // Fetch user info from backend
        setProfile(response.data.user);        // Set local state
        dispatch(setUser(response.data.user)); // Update Redux store
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  /**
   * Update profile state when user types in an input field.
   * Applies to all editable fields.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Save the selected image file in state when the user uploads a profile picture.
   */
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  /**
   * Handle saving changes (with or without profile picture update).
   * Submits the form to the backend via PUT and POST.
   */
  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Build the fields to update
      const updatedData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        address: profile.address,
        zip: profile.zip,
        city: profile.city,
        phone: profile.phone,
      };

      // Handle image upload if a new picture is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('picture', selectedFile);

        const uploadResponse = await api.post(`/user/${profile.id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Update local profile with the filename
        setProfile((prev) => ({
          ...prev,
          picture: uploadResponse.data.filename,
        }));

        updatedData.picture = uploadResponse.data.filename;
      }

      // Send profile update request
      await api.put(`/user/${profile.id}`, updatedData);

      setMessage('Profile updated successfully.');
      setEditing(false);      // Exit editing mode
      setSelectedFile(null);  // Clear file input
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  // Render loading indicator
  if (loading) return <div className="profile-message">Loading profile...</div>;

  // If profile not found or error
  if (!profile) {
    return <div className="profile-message error">{message || 'Profile not found.'}</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>

      {/* Feedback message (success or error) */}
      {message && <p className="profile-message">{message}</p>}

      {/* Display profile picture if available */}
      {profile.picture && (
        <div className="profile-image-wrapper">
          <img
            src={`http://ihsanerdemunal.ide.3wa.io:9500/uploads/${profile.picture}?t=${Date.now()}`}
            alt="Profile"
            className="profile-image"
          />
        </div>
      )}

      {/* Editable form if editing mode is active */}
      {editing ? (
        <>
          {/* File input for uploading new profile picture */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="profile-file-input"
          />

          {/* Input fields for editable profile fields */}
          <div className="profile-form">
            {['firstName', 'lastName', 'email', 'address', 'zip', 'city', 'phone'].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={profile[field] ?? ''}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
          </div>
        </>
      ) : (
        // Display read-only version of the profile
        <div className="profile-details">
          <p><strong>First Name:</strong> {profile.firstName}</p>
          <p><strong>Last Name:</strong> {profile.lastName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <p><strong>City:</strong> {profile.city}</p>
          <p><strong>ZIP:</strong> {profile.zip}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      )}

      {/* Button actions: Save or Edit */}
      <div className="profile-actions">
        {editing ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-green"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-blue"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
