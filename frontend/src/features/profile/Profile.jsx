import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import api from '../../api/axios';
import '/src/styles/main.scss';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

function buildAvatarSrc(file) {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  // your backend sometimes uses /uploads/<file>; keep that and allow /uploads/users as well
  const primary = `${BASE_URL ? `${BASE_URL}/` : '/'}uploads/${file}`.replace(/([^:]\/)\/+/g, '$1');
  return primary;
}

function initialsFrom(nameA, nameB) {
  const f = (nameA || '').trim().charAt(0).toUpperCase();
  const l = (nameB || '').trim().charAt(0).toUpperCase();
  return (f + l) || 'U';
}

export default function Profile() {
  const dispatch = useDispatch();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [flash, setFlash]       = useState({ type: '', msg: '' });

  // image selection + live preview
  const [file, setFile]         = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const prevUrlRef = useRef(null);

  // load profile
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/me');
        if (cancel) return;
        setProfile(data?.user || null);
        dispatch(setUser(data?.user || null));
      } catch (err) {
        if (!cancel) setFlash({ type: 'error', msg: 'Failed to load profile. Please login again.' });
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [dispatch]);

  // file change → preview
  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = f ? URL.createObjectURL(f) : null;
    prevUrlRef.current = url;
    setPreviewUrl(url);
  };

  useEffect(() => () => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
  }, []);

  // text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const avatarSrc = useMemo(() => {
    // prefer live preview; else server file
    return previewUrl || buildAvatarSrc(profile?.picture);
  }, [previewUrl, profile?.picture]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setFlash({ type: '', msg: '' });

    try {
      // basic validation
      if (!profile.firstName?.trim() || !profile.lastName?.trim()) {
        throw new Error('First name and last name are required.');
      }

      // optional upload
      let newFilename = null;
      if (file) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) throw new Error('Invalid image type. Use JPG, PNG, or WEBP.');
        if (file.size > 2 * 1024 * 1024) throw new Error('Image too large (max 2MB).');

        const fd = new FormData();
        fd.append('picture', file);

        const uploadRes = await api.post(`/user/${profile.id}/upload`, fd); // axios sets headers
        newFilename = uploadRes.data?.filename;
        if (!newFilename) throw new Error('Upload did not return a filename.');
      }

      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        address: profile.address,
      // optional: zip and city may be numeric/strings; keep as-is
        zip: profile.zip,
        city: profile.city,
        phone: profile.phone,
        ...(newFilename && { picture: newFilename }),
      };

      await api.put(`/user/${profile.id}`, payload);

      // refresh /me to keep redux + client in sync with any server-side transforms
      const { data } = await api.get('/me');
      setProfile(data?.user || { ...profile, ...(newFilename && { picture: newFilename }) });
      dispatch(setUser(data?.user || { ...profile, ...(newFilename && { picture: newFilename }) }));

      // clear selection state
      setFile(null);
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
      setPreviewUrl(null);

      setEditing(false);
      setFlash({ type: 'success', msg: 'Profile updated successfully.' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setFlash({ type: 'error', msg: err?.response?.data?.message || err?.message || 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="profile-card skeleton">
        <div className="sk-avatar"></div>
        <div className="sk-line w-60"></div>
        <div className="sk-line w-40"></div>
        <div className="sk-line w-80"></div>
      </section>
    );
  }

  if (!profile) {
    return <div className="profile-banner error">{flash.msg || 'Profile not found.'}</div>;
  }

  const initials = initialsFrom(profile.firstName, profile.lastName);

  return (
    <section className="profile-card">
      <header className="profile-head">
        <div className="avatar-wrap" aria-label="Profile picture">
          {avatarSrc ? (
            <img
              src={`${avatarSrc}?v=${profile.picture ? encodeURIComponent(profile.picture) : Date.now()}`}
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              alt={`${profile.firstName || ''} ${profile.lastName || ''}`}
              className="avatar"
            />
          ) : (
            <div className="avatar placeholder" aria-hidden="true">{initials}</div>
          )}
        </div>

        <div className="head-info">
          <h1 className="title">{profile.firstName} {profile.lastName}</h1>
          <p className="subtitle">{profile.email}</p>
        </div>
      </header>

      {flash.msg && (
        <div className={`profile-banner ${flash.type === 'error' ? 'error' : 'success'}`} role="status" aria-live="polite">
          {flash.msg}
        </div>
      )}

      <div className="profile-body">
        {editing ? (
          <>
            <div className="grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" value={profile.firstName || ''} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" value={profile.lastName || ''} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={profile.email || ''} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={profile.phone || ''} onChange={handleChange} />
              </div>
              <div className="field wide">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={profile.address || ''} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="zip">ZIP</label>
                <input id="zip" name="zip" value={profile.zip || ''} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={profile.city || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="upload">
              <label htmlFor="picture">Profile picture (JPG/PNG/WEBP ≤ 2MB)</label>
              <input id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={saving} />
            </div>
          </>
        ) : (
          <div className="readout">
            <div><strong>First name:</strong> {profile.firstName}</div>
            <div><strong>Last name:</strong> {profile.lastName}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Phone:</strong> {profile.phone || '—'}</div>
            <div><strong>Address:</strong> {profile.address || '—'}</div>
            <div><strong>ZIP:</strong> {profile.zip || '—'}</div>
            <div><strong>City:</strong> {profile.city || '—'}</div>
            <div><strong>Role:</strong> {profile.role}</div>
          </div>
        )}
      </div>

      <footer className="profile-actions">
        {editing ? (
          <>
            <button type="button" className="button" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={handleSave}
              disabled={saving}
              data-loading={saving ? 'true' : 'false'}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        ) : (
          <button type="button" className="button button--accent" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        )}
      </footer>
    </section>
  );
}
