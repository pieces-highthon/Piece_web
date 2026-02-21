import { useState } from "react";
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
const mockUser = { name: "홍길동" };

function App() {
  const [screen, setScreen] = useState("intro"); // "intro" | "main" | "complete"
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // 편지 데이터를 저장하여 Complete 컴포넌트에 전달
  const [letterData, setLetterData] = useState(null);

  const handleEnvelopeClick = () => {
    setIsOpen(true);
    setTimeout(() => setShowModal(true), 800);
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => setIsOpen(false), 100);
  };

  const handleSubmit = (value) => {
    console.log("입력값:", value);
    setLetterData(value); // 편지 데이터 저장
    setShowModal(false);
    setIsOpen(false);
    setScreen("complete");
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
                {!isOpen && (
                  <p className="app-guide">{mockUser.name}님께 드릴 편지를 적어주세요 !</p>
                )}
                <Envelope isOpen={isOpen} hasContent={false} onClick={handleEnvelopeClick} />
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
