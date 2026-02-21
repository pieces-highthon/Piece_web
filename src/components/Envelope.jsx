import { useState, useEffect } from "react";
import "./Envelope.css";

function Envelope({ isOpen, hasContent, onClick }) {
  const [letterOut, setLetterOut] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [overflowVisible, setOverflowVisible] = useState(false);
  const [puzzleShape, setPuzzleShape] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPuzzleShape(false);
      setOverflowVisible(true);
      setFlapOpen(true);
      const t = setTimeout(() => setLetterOut(true), 300);
      return () => clearTimeout(t);
    } else {
      setLetterOut(false);
      if (hasContent) {
        const tp = setTimeout(() => setPuzzleShape(true), 300);
        const t1 = setTimeout(() => setFlapOpen(false), 1200);
        const t2 = setTimeout(() => setOverflowVisible(false), 1700);
        return () => { clearTimeout(tp); clearTimeout(t1); clearTimeout(t2); };
      } else {
        const t1 = setTimeout(() => setFlapOpen(false), 500);
        const t2 = setTimeout(() => setOverflowVisible(false), 1000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    }
  }, [isOpen, hasContent]);

  const className = [
    "envelope",
    flapOpen ? "envelope--flap-open" : "",
    letterOut ? "envelope--letter-out" : "",
    overflowVisible ? "envelope--overflow" : "",
    puzzleShape ? "envelope--puzzle" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onClick={!isOpen ? onClick : undefined}>
      <div className="envelope-flap" />
      <div className="envelope-letter">
        <div className="envelope-letter-line" />
        <div className="envelope-letter-line short" />
        <div className="envelope-letter-line" />
      </div>
      <div className="envelope-body" />
    </div>
  );
}

export default Envelope;
