import React, { useState, useEffect, useCallback } from 'react';
import GameInstance from './GameInstance';
import GeneticAlgorithm from './GeneticAlgorithm';
import GenerationInfo from './GenerationInfo';
import './index.css';

function Game() {
  const [geneticAlgorithm, setGeneticAlgorithm] = useState(null);
  const [currentGeneration, setCurrentGeneration] = useState(1);
  const [bestScore, setBestScore] = useState(0);

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [aiPlayers, setAiPlayers] = useState([]);
  const [gameOverStatus, setGameOverStatus] = useState({}); // 각 플레이어의 게임 오버 상태를 추적

  // 초기 유전 알고리즘 설정
  useEffect(() => {
    const ga = new GeneticAlgorithm(10); // 10개의 유전자
    setGeneticAlgorithm(ga);
    setAiPlayers(ga.population);
  }, []);

  // 게임 종료 시 호출되는 함수
  const handleGameOver = useCallback((index, score, aiPlayer) => {
    aiPlayer.setFitness(score);
    console.log(`[${index}] stop game ${score}`);
    setGameOverStatus(prevStatus => ({
      ...prevStatus,
      [index]: true,
    }));
    setBestScore(prevBest => Math.max(prevBest, score));
  }, []);

  // 게임 재시작을 관리하는 useEffect
  useEffect(() => {
    if (isAutoPlay && Object.keys(gameOverStatus).length === aiPlayers.length && aiPlayers.length > 0) {
      // 모든 게임이 종료되었고 자동 재생이 활성화된 경우
      geneticAlgorithm.nextGeneration();
      setCurrentGeneration(geneticAlgorithm.generation + 1); // 세대 업데이트
      setAiPlayers([...geneticAlgorithm.population]); // 새로운 세대의 AI 플레이어 설정
      setGameOverStatus({}); // 게임 오버 상태 초기화
    } else {
      console.log(isAutoPlay, gameOverStatus, aiPlayers.length);
    }
  }, [gameOverStatus, isAutoPlay, aiPlayers.length, geneticAlgorithm]);

  // 자동 재생 토글 함수
  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
    if (!isAutoPlay) {
      setGameOverStatus({}); // 자동 재생 시작 시 상태 초기화
    }
  };

  return (
    <div className="game">
      <GenerationInfo generation={currentGeneration} bestScore={bestScore} />
      <button onClick={toggleAutoPlay}>
        {isAutoPlay ? '자동 플레이 중지' : '자동 플레이 시작'}
      </button>
      <div className="game-boards">
        {aiPlayers.map((aiPlayer, index) => (
          <GameInstance
            key={index}
            index={index}
            aiPlayer={aiPlayer}
            isAutoPlay={isAutoPlay}
            onGameOver={(score) => handleGameOver(index, score, aiPlayer)}
            gameOverStatus={gameOverStatus}
          />
        ))}
      </div>
    </div>
  );
}

export default Game;