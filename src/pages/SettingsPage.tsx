import { useState, useEffect } from 'react';
import { Button, TextInput, TextArea, Toast } from '../components';
import { settingsService } from '../services';
import type { AppSettings, SettingsFormData } from '../types';

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [formData, setFormData] = useState<SettingsFormData>({
    app_name: '',
    app_description: '',
    office_name: '',
    office_address: '',
    office_phone: '',
    office_email: '',
  });

  useEffect(() => {
    settingsService.getSettings()
      .then((settings: AppSettings) => {
        setFormData({
          app_name: settings.app_name,
          app_description: settings.app_description || '',
          office_name: settings.office_name || '',
          office_address: settings.office_address || '',
          office_phone: settings.office_phone || '',
          office_email: settings.office_email || '',
        });
        if (settings.logo_url) {
          setLogoPreview(settings.logo_url);
        }
        if (settings.favicon_url) {
          setFaviconPreview(settings.favicon_url);
        }
      })
      .catch(() => {
        setToast({ message: 'Failed to load settings', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SettingsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(formData);
      setToast({ message: 'Settings saved successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

       const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ message: 'Only PNG, JPG, JPEG, SVG, and WEBP files are allowed', type: 'error' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: 'File size must be less than 2MB', type: 'error' });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width > 512 || img.height > 512) {
        setToast({ message: 'Image dimensions must be 512x512 pixels or less', type: 'error' });
        return;
      }
      
      if (img.width < 32 || img.height < 32) {
        setToast({ message: 'Image dimensions must be at least 32x32 pixels', type: 'error' });
        return;
      }

      setUploading(true);
      try {
        const result = await settingsService.uploadLogo(file);
        console.log('Upload result:', result); // Debug line
        setLogoPreview(result.logo_url);
        setToast({ message: 'Logo uploaded successfully', type: 'success' });
      } catch (err) {
        console.error('Upload error:', err); // Debug line
        const error = err as { response?: { data?: { errors?: { logo?: string[] } } } };
        const errorMsg = error.response?.data?.errors?.logo?.[0] || 'Failed to upload logo';
        setToast({ message: errorMsg, type: 'error' });
      } finally {
        setUploading(false);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setToast({ message: 'Invalid image file', type: 'error' });
    };

    img.src = objectUrl;
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.ico')) {
      setToast({ message: 'Only PNG, ICO, SVG, and WEBP files are allowed', type: 'error' });
      return;
    }

    if (file.size > 1024 * 1024) {
      setToast({ message: 'File size must be less than 1MB', type: 'error' });
      return;
    }

    if (file.type === 'image/svg+xml' || file.name.endsWith('.ico')) {
      setUploadingFavicon(true);
      try {
        const result = await settingsService.uploadFavicon(file);
        setFaviconPreview(result.favicon_url);
        setToast({ message: 'Favicon uploaded successfully.', type: 'success' });
        
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = result.favicon_url;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = result.favicon_url;
          document.head.appendChild(newLink);
        }
      } catch (err) {
        const error = err as { response?: { data?: { errors?: { favicon?: string[] } } } };
        const errorMsg = error.response?.data?.errors?.favicon?.[0] || 'Failed to upload favicon';
        setToast({ message: errorMsg, type: 'error' });
      } finally {
        setUploadingFavicon(false);
      }
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width > 256 || img.height > 256) {
        setToast({ message: 'Favicon dimensions must be 256x256 pixels or less', type: 'error' });
        return;
      }
      
      if (img.width < 16 || img.height < 16) {
        setToast({ message: 'Favicon dimensions must be at least 16x16 pixels', type: 'error' });
        return;
      }

      setUploadingFavicon(true);
      try {
        const result = await settingsService.uploadFavicon(file);
        setFaviconPreview(result.favicon_url);
        setToast({ message: 'Favicon uploaded successfully. It may take a moment to reflect.', type: 'success' });
        
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = result.favicon_url;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = result.favicon_url;
          document.head.appendChild(newLink);
        }
      } catch (err) {
        const error = err as { response?: { data?: { errors?: { favicon?: string[] } } } };
        const errorMsg = error.response?.data?.errors?.favicon?.[0] || 'Failed to upload favicon';
        setToast({ message: errorMsg, type: 'error' });
      } finally {
        setUploadingFavicon(false);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setToast({ message: 'Invalid image file', type: 'error' });
    };

    img.src = objectUrl;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-[#e5e5e5] rounded" />
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#e5e5e5] rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Settings</h2>
          <p className="text-[#737373]">Configure application branding and office information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Branding</h3>

            <TextInput
              id="app_name"
              label="App Name"
              value={formData.app_name}
              onChange={(value) => handleChange('app_name', value)}
              required
            />

            <TextArea
              id="app_description"
              label="App Description"
              value={formData.app_description}
              onChange={(value) => handleChange('app_description', value)}
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">App Logo</label>
              <div className="flex items-start gap-4">
                {logoPreview && (
                  <div className="w-24 h-24 border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
                    <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-[#737373] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-[#737373]">PNG, JPG, JPEG, SVG, or WEBP. Max 2MB. 32x32 to 512x512 pixels.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Favicon</label>
              <div className="flex items-start gap-4">
                {faviconPreview && (
                  <div className="w-16 h-16 border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden bg-[#f5f5f5] flex items-center justify-center p-2">
                    <img src={faviconPreview} alt="Favicon" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".png,.ico,.svg,.webp"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="block w-full text-sm text-[#737373] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-[#737373]">PNG, ICO, SVG, or WEBP. Max 1MB. 16x16 to 256x256 pixels.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Office Information</h3>

            <TextInput
              id="office_name"
              label="Office Name"
              value={formData.office_name}
              onChange={(value) => handleChange('office_name', value)}
            />

            <TextArea
              id="office_address"
              label="Office Address"
              value={formData.office_address}
              onChange={(value) => handleChange('office_address', value)}
              rows={2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                id="office_phone"
                label="Office Phone"
                type="tel"
                value={formData.office_phone}
                onChange={(value) => handleChange('office_phone', value)}
              />

              <TextInput
                id="office_email"
                label="Office Email"
                type="email"
                value={formData.office_email}
                onChange={(value) => handleChange('office_email', value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SettingsPage;