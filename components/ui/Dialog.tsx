'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const OPEN_EVENT = 'williamshub:dialog-open';
let scrollLocks = 0;
let previousOverflow = '';

// Native modal dialogs keep keyboard and screen-reader navigation inside the
// overlay and restore focus to its trigger. Only one shell overlay stays open.
export default function Dialog({
  label,
  onClose,
  children,
  className = '',
  drawer = false,
  id,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  drawer?: boolean;
  id?: string;
}) {
  const instance = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onAnotherOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== instance) closeRef.current();
    };
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: instance }));
    window.addEventListener(OPEN_EVENT, onAnotherOpen);
    if (scrollLocks++ === 0) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      window.removeEventListener(OPEN_EVENT, onAnotherOpen);
      dialog.close();
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (previous?.isConnected && !document.querySelector('dialog[open]')) previous.focus({ preventScroll: true });
    };
  }, [instance]);

  return createPortal(
    <dialog
      ref={ref}
      id={id}
      aria-label={label}
      aria-modal="true"
      className={`overlay${drawer ? ' drawer-overlay' : ''}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`${drawer ? 'app-drawer' : 'dialog'} ${className}`}>{children}</div>
    </dialog>,
    document.body,
  );
}
