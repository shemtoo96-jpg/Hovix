import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface SafetyNetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const SafetyNetModal: React.FC<SafetyNetModalProps> = ({ isOpen, onClose, title }) => {
  const modalTitle = title || "It sounds like you're going through a lot";
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4 text-text-light dark:text-gray-300">
        <p>
          Your feelings are valid, and it's brave of you to express them. Please remember that help is available and you don't have to go through this alone.
        </p>
        <p className="font-semibold">
          If you are in immediate danger, please call your local emergency number. Here are some resources that can provide immediate support:
        </p>
        <ul className="list-disc list-inside space-y-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <li>
            <strong>Crisis Text Line:</strong> Text HOME to 741741
          </li>
          <li>
            <strong>National Suicide Prevention Lifeline:</strong> Call or text 988
          </li>
          <li>
            <strong>The Trevor Project (for LGBTQ youth):</strong> 1-866-488-7386
          </li>
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          These services are free, confidential, and available 24/7. Reaching out is a sign of strength.
        </p>
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>I Understand</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SafetyNetModal;