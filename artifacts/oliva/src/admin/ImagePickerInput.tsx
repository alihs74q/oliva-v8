import { useRef, useState } from 'react';

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
      onChange(await imageFileToDataUrl(file));
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
            placeholder="Image URL or choose a file"
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
              {uploading ? 'Preparing…' : '📎 Choose image'}
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

const MAX_IMAGE_DATA_URL_LENGTH = 70_000;
const MAX_IMAGE_DIMENSION = 1200;

async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Image is too large. Please choose an image under 12 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    let width = Math.max(1, Math.round(image.naturalWidth * scale));
    let height = Math.max(1, Math.round(image.naturalHeight * scale));
    let quality = 0.8;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser cannot prepare this image.');
      context.drawImage(image, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/webp', quality);
      if (dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) return dataUrl;

      quality = Math.max(0.5, quality - 0.06);
      width = Math.max(480, Math.round(width * 0.82));
      height = Math.max(480, Math.round(height * 0.82));
    }

    throw new Error('This image is too detailed. Please choose a simpler image.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
