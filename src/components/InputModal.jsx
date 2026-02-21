import { useState } from "react";
import "./InputModal.css";

function InputModal({ isOpen, onClose, onSubmit }) {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = () => {
    if (message.trim()) {
      const data = { to: to.trim(), from: from.trim(), message: message.trim() };
      setTo("");
      setFrom("");
      setMessage("");
      onSubmit(data);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-wrapper" onClick={handleOverlayClick}>
        <div className="modal-letter">
          <div className="letter-field">
            <label className="letter-label">To.</label>
            <input
              type="text"
              className="letter-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <textarea
            className="letter-textarea"
            placeholder="편지 내용을 작성하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />
          <div className="letter-field letter-field-from">
            <label className="letter-label">From.</label>
            <input
              type="text"
              className="letter-input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
        </div>
        <button className="letter-submit" onClick={handleSubmit}>
          선물하기
        </button>
      </div>
    </div>
  );
}

export default InputModal;
