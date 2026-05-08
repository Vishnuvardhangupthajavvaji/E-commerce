// frontend/src/components/ConfirmModal.jsx
// A clean, responsive confirmation popup — replaces all window.alert / window.confirm.
//
// USAGE:
//   import ConfirmModal from "../components/ConfirmModal";
//
//   const [modal, setModal] = useState(null);
//
//   // To show:
//   setModal({
//     title:   "Clear Cart",
//     message: "Remove all items from your cart?",
//     confirm: "Yes, clear it",
//     danger:  true,            // makes confirm button red (optional)
//     onConfirm: () => { /* do the thing */ setModal(null); },
//   });
//
//   // In JSX:
//   {modal && <ConfirmModal {...modal} onCancel={() => setModal(null)} />}

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTriangleExclamation, faCircleCheck, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

function ConfirmModal({
  title    = "Are you sure?",
  message  = "",
  confirm  = "Confirm",
  cancel   = "Cancel",
  danger   = false,      // red confirm button
  success  = false,      // green confirm button (info/success variant)
  icon     = null,       // override icon
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const defaultIcon = danger  ? faTriangleExclamation
                    : success ? faCircleCheck
                    :           faCircleInfo;
  const modalIcon = icon || defaultIcon;

  return (
    <>
      {/* Backdrop */}
      <div className="cm-backdrop" onClick={onCancel} />

      {/* Modal box */}
      <div className="cm-box" role="dialog" aria-modal="true">
        {/* Close button */}
        <button className="cm-close" onClick={onCancel} aria-label="Close">
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Icon */}
        <div className={`cm-icon-wrap ${danger ? "cm-icon-wrap--danger" : success ? "cm-icon-wrap--success" : "cm-icon-wrap--info"}`}>
          <FontAwesomeIcon icon={modalIcon} />
        </div>

        {/* Text */}
        <h3 className="cm-title">{title}</h3>
        {message && <p className="cm-message">{message}</p>}

        {/* Buttons */}
        <div className="cm-actions">
          <button className="btn cm-btn-cancel" onClick={onCancel}>
            {cancel}
          </button>
          <button
            className={`btn cm-btn-confirm ${danger ? "cm-btn-confirm--danger" : success ? "cm-btn-confirm--success" : ""}`}
            onClick={onConfirm}
          >
            {confirm}
          </button>
        </div>
      </div>
    </>
  );
}

export default ConfirmModal;