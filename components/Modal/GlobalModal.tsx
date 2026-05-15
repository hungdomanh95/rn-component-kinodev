import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { hideModal, ModalConfig, ModalManager } from './ModalManager';

const GlobalModal: React.FC = () => {
  const [stack, setStack] = useState<ModalConfig[]>([]);

  useEffect(() => {
    return ModalManager.subscribe(setStack);
  }, []);

  if (stack.length === 0) return null;

  const config = stack[stack.length - 1];

  return (
    <Modal
      key={stack.length}
      visible
      title={config.title}
      type={config.type}
      onConfirm={config.onConfirm}
      onCancel={config.onCancel}
      showCancel={config.showCancel}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      footer={config.footer}
      scrollable={config.scrollable}
      maxHeight={config.maxHeight}
      disableBackdropClose={config.disableBackdropClose}
      onClose={hideModal}
    >
      {config.content}
    </Modal>
  );
};

export default GlobalModal;
