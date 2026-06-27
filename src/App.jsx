import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Intro from "./components/Intro";
import Envelope from "./components/Envelope";
import InputModal from "./components/InputModal";
import Complete from "./components/Complete";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFail from "./components/PaymentFail";
import pieceLogo from "./assets/PIECE.png";
import "./App.css";

// 목데이터
const mockUser = { name: "김진현" };

function App() {
  const [screen, setScreen] = useState("intro"); // "intro" | "main" | "complete"
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // 편지 데이터를 저장하여 Complete 컴포넌트에 전달
  const [letterData, setLetterData] = useState(null);
  const modalTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  const clearTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer(modalTimerRef);
      clearTimer(closeTimerRef);
      clearTimer(completeTimerRef);
    };
  }, []);

  const handleEnvelopeClick = () => {
    clearTimer(modalTimerRef);
    setIsOpen(true);
    modalTimerRef.current = setTimeout(() => {
      setShowModal(true);
      modalTimerRef.current = null;
    }, 800);
  };

  const handleClose = () => {
    clearTimer(closeTimerRef);
    setShowModal(false);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 100);
  };

  const handleSubmit = (value) => {
    clearTimer(completeTimerRef);
    setLetterData(value); // 편지 데이터 저장
    setShowModal(false);
    setIsOpen(false);
    completeTimerRef.current = setTimeout(() => {
      setScreen("complete");
      completeTimerRef.current = null;
    }, 1700);
  };

  return (
    <Routes>
      {/* 메인 앱 화면 */}
      <Route
        path="/"
        element={
          <div className="app">
            <img src={pieceLogo} alt="PIECE" className="app-logo" />
            {screen === "intro" && (
              <Intro userName={mockUser.name} onStart={() => setScreen("main")} />
            )}
            {screen === "main" && (
              <>
                {!isOpen && !letterData && (
                  <p className="app-guide">{mockUser.name}님께 드릴 편지를 적어주세요 !</p>
                )}
                <Envelope
                  isOpen={isOpen}
                  hasContent={Boolean(letterData)}
                  onClick={letterData ? undefined : handleEnvelopeClick}
                />
                <InputModal
                  isOpen={showModal}
                  onClose={handleClose}
                  onSubmit={handleSubmit}
                />
              </>
            )}
            {screen === "complete" && (
              <Complete userName={mockUser.name} letterData={letterData} />
            )}
          </div>
        }
      />
      {/* 결제 성공 리다이렉트 페이지 */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      {/* 결제 실패 리다이렉트 페이지 */}
      <Route path="/payment/fail" element={<PaymentFail />} />
    </Routes>
  );
}

export default App;
