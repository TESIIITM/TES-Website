'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import { Checkbox } from './fields';

export type FetchedImage = { sourceUrl: string; dataUrl: string };

type Props = {
  label: string;
  state: FormState;
  /** The stored image, if the item has one. */
  currentUrl: string | null;
  /** The linked page's image, once its preview has been fetched. */
  fetched: FetchedImage | null;
  onDiscardFetched: () => void;
  /** Rendered size of the preview; also sets its aspect ratio. */
  width: number;
  height: number;
  /** Where a fetched image comes from, for the hint. */
  sourceName?: string;
};

/**
 * Picks the image to store: the linked page's own image, an upload, or none.
 * Whichever was chosen last wins, so fetching a preview clears a chosen file.
 */
export function PreviewImageField({ label, state, currentUrl, fetched, onDiscardFetched, width, height, sourceName = 'The page’s own image' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<string | null>(null);

  useEffect(() => () => { if (upload) URL.revokeObjectURL(upload); }, [upload]);
  useEffect(() => {
    if (!fetched || !fileRef.current) return;
    fileRef.current.value = '';
    setUpload(null);
  }, [fetched]);

  const errors = state.fieldErrors?.image;
  const shown = upload ?? fetched?.dataUrl ?? currentUrl;

  return (
    <div className="admin-field admin-field-wide" data-invalid={errors ? '' : undefined}>
      <label htmlFor="image">{label}</label>
      <div className="admin-portrait-input">
        <div className="admin-portrait-preview admin-image-preview" style={{ width, height }}>
          {shown ? <Image src={shown} alt="" width={width} height={height} unoptimized={shown !== currentUrl} /> : <span>No image</span>}
        </div>
        <div>
          <input type="hidden" name="imageSourceUrl" value={upload ? '' : fetched?.sourceUrl ?? ''} />
          <input
            ref={fileRef}
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-describedby="image-hint"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setUpload(file ? URL.createObjectURL(file) : null);
            }}
          />
          <p className="admin-field-hint" id="image-hint">{sourceName} is used when you fetch the preview. Or upload a JPEG, PNG, or WebP up to 2 MB.</p>
          {errors && <p className="admin-field-error">{errors[0]}</p>}
          {fetched && !upload && <button className="admin-link" type="button" onClick={onDiscardFetched}>Don’t use this image</button>}
          {currentUrl && !fetched && !upload && <Checkbox name="removeImage" label="Remove the current image" state={initialFormState} defaultChecked={false} />}
        </div>
      </div>
    </div>
  );
}
