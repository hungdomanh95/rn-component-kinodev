import React from 'react';

export interface ModalConfig {
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  content?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  /** Override màu nút confirm — mặc định theo `type` (error → đỏ). Dùng khi
   * hành động confirm không phải destructive (vd "Thử lại" sau lỗi mạng). */
  confirmColor?: string;
  footer?: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: number | `${number}%`;
  disableBackdropClose?: boolean;
}

type Listener = (stack: ModalConfig[]) => void;

const listeners: Listener[] = [];
let stack: ModalConfig[] = [];

const subscribe = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notify = () => listeners.forEach((l) => l(stack));

export const showModal = (config: ModalConfig) => {
  stack = [...stack, config];
  notify();
};

export const hideModal = () => {
  stack = stack.slice(0, -1);
  notify();
};

export const ModalManager = { subscribe };
