'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

type Props = {
  /** A Server Action already bound to the record's id. */
  action: () => Promise<void>;
  /** What is being deleted, e.g. "Dr. Rahul Kala". */
  itemName: string;
  label?: string;
};

export function DeleteButton({ action, itemName, label = 'Delete' }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const confirm = () => startTransition(async () => {
    await action();
    setOpen(false);
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="admin-link admin-link-danger">{label}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content admin-confirm">
          <Dialog.Title>Delete {itemName}?</Dialog.Title>
          <Dialog.Description>This removes it from the site straight away. It cannot be undone.</Dialog.Description>
          <div className="admin-form-actions">
            <button className="admin-button admin-button-danger" onClick={confirm} disabled={pending}>{pending ? 'Deleting…' : 'Delete'}</button>
            <Dialog.Close className="admin-button admin-button-quiet">Cancel</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
