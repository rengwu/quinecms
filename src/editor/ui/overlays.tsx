import type { HTMLAttributes, ReactNode } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Toast } from '@base-ui/react/toast';
import { XIcon } from '@phosphor-icons/react';
import { Button, cx } from './controls';
import { usePortalContainer } from './portal';
import css from './ui.module.css';

function DialogPopup({
  size,
  className,
  children,
}: {
  size?: 'base' | 'lg';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <BaseDialog.Portal container={usePortalContainer()}>
      <BaseDialog.Backdrop className={css.backdrop} />
      <BaseDialog.Popup className={cx(css.dialog, className)} data-size={size}>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
export const Dialog = Object.assign(DialogPopup, {
  Root: BaseDialog.Root,
  Close: BaseDialog.Close,
  Title: ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <BaseDialog.Title className={cx(css.title, className)} {...props} />
  ),
  Description: ({
    className,
    ...props
  }: HTMLAttributes<HTMLParagraphElement>) => (
    <BaseDialog.Description
      className={cx(css.description, className)}
      {...props}
    />
  ),
});

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal container={usePortalContainer()}>
      <Toast.Viewport className={css.toasts}>
        {toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast} className={css.toast}>
            <Toast.Title className={css.title} />
            <Toast.Description className={css.description} />
            <Toast.Close
              aria-label="Close"
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  shape="square"
                  className={css.close}
                  icon={<XIcon />}
                />
              }
            />
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
export function Toasts({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <ToastList />
    </Toast.Provider>
  );
}
export function useToast() {
  const manager = Toast.useToastManager();
  return {
    add({
      variant,
      ...options
    }: {
      title: ReactNode;
      description?: ReactNode;
      variant?: 'success' | 'error';
      timeout?: number;
    }) {
      return manager.add({
        ...options,
        type: variant,
        priority: variant === 'error' ? 'high' : 'low',
      });
    },
  };
}
