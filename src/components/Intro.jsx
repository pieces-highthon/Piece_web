import { useState } from "react";
import pieceLogo from "../assets/PIECE.png";
import logoPiece from "../assets/logopiece.svg";
import "./Intro.css";

function Intro({ userName, onStart }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => onStart(), 800);
  };

  return (
    <div className={`intro ${fadeOut ? "intro--fade-out" : ""}`}>
      <img src={pieceLogo} alt="PIECE" className="intro-top-logo" />
      <div className="intro-center">
        <p className="intro-message">{userName}님의 선물을 준비해볼까요?</p>
        <img src={logoPiece} alt="PIECE" className="intro-logo" />
      </div>
      <button className="intro-button" onClick={handleStart}>
        시작하기
      </button>
    </div>
  );
}

export default Intro;
