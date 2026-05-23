'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ToastVariant = 'info' | 'success' | 'error' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
  tone?: 'primary' | 'secondary';
}

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  actions?: ToastAction[];
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ToastContextValue {
  showToast: (options: {
    title: string;
    description?: string;
    variant?: ToastVariant;
    durationMs?: number;
  }) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<
  ToastVariant,
  { background: string; borderColor: string; color: string }
> = {
  info: {
    background: '#eff6ff',
    borderColor: '#bfdbfe',
    color: '#1e3a8a',
  },
  success: {
    background: '#ecfdf5',
    borderColor: '#a7f3d0',
    color: '#065f46',
  },
  error: {
    background: '#fef2f2',
    borderColor: '#fecaca',
    color: '#991b1b',
  },
  warning: {
    background: '#fffbeb',
    borderColor: '#fde68a',
    color: '#92400e',
  },
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const style = variantStyles[toast.variant];
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        borderRadius: 10,
        border: `1px solid ${style.borderColor}`,
        background: style.background,
        color: style.color,
        padding: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,0.20)',
      }}
      role="status"
      aria-live="assertive"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700 }}>{toast.title}</p>
          {toast.description && (
            <p style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>{toast.description}</p>
          )}
        </div>
        {!toast.actions?.length && (
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              opacity: 0.8,
            }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>
      {toast.actions && toast.actions.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {toast.actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              style={
                action.tone === 'primary'
                  ? {
                      borderRadius: 8,
                      border: '1px solid #111827',
                      background: '#111827',
                      color: '#ffffff',
                      fontSize: 13,
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }
                  : {
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      color: '#374151',
                      fontSize: 13,
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = 'info',
      durationMs = 4000,
    }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
      durationMs?: number;
    }) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast],
  );

  const confirm = useCallback(
    ({
      title,
      description,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
    }: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
        const id = nextId.current++;

        const handleResolve = (value: boolean) => {
          removeToast(id);
          resolve(value);
        };

        setToasts((prev) => [
          ...prev,
          {
            id,
            title,
            description,
            variant: 'warning',
            actions: [
              {
                label: cancelLabel,
                tone: 'secondary',
                onClick: () => handleResolve(false),
              },
              {
                label: confirmLabel,
                tone: 'primary',
                onClick: () => handleResolve(true),
              },
            ],
          },
        ]);
      });
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      confirm,
    }),
    [showToast, confirm],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 2147483647,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              pointerEvents: 'none',
            }}
          >
            {toasts.map((toast) => (
              <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                <ToastCard toast={toast} onClose={() => removeToast(toast.id)} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
