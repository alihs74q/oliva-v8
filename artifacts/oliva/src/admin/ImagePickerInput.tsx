import { useRef, useState } from 'react';
import { apiUploadMedia } from './useAdminApi';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImagePickerInput({ value, onChange, label = 'Image' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const result = await apiUploadMedia(file);
      onChange(result.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Current image preview */}
        {value && (
          <img
            src={value}
            alt="Preview"
            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or /images/..."
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={uploading}
              style={{
                padding: '6px 12px',
                background: uploading ? 'rgba(212,168,67,0.3)' : 'rgba(212,168,67,0.15)',
                border: '1px solid rgba(212,168,67,0.4)',
                borderRadius: 6,
                color: '#D4A843',
                fontSize: 12,
                fontWeight: 600,
                cursor: uploading ? 'default' : 'pointer',
              }}
            >
              {uploading ? 'Uploading…' : '📎 Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                style={{ padding: '6px 10px', background: 'transparent', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#fca5a5', fontSize: 11, cursor: 'pointer' }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>
      {error && <span style={{ fontSize: 12, color: '#fca5a5' }}>{error}</span>}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
  color: 'rgba(245,242,232,0.5)', textTransform: 'uppercase',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7, color: '#f5f2e8', fontSize: 13,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
