import React, { useState, useEffect } from 'react';
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
  const [gameOverCounts, setGameOverCounts] = useState(0);

  // 초기 유전 알고리즘 설정
  useEffect(() => {
    const ga = new GeneticAlgorithm(10); // 10개의 유전자
    setGeneticAlgorithm(ga);
    setAiPlayers(ga.population);
  }, []);

  // 게임 종료 시 호출되는 함수
  const handleGameOver = (index, score, aiPlayer) => {
    aiPlayer.setFitness(score);

    console.log(`[${index}] stop game ${score}`)

    setGameOverCounts((prevCount) => prevCount + 1);
    setBestScore((prevBest) => Math.max(prevBest, score));
  };

  // 게임 재시작을 관리하는 useEffect
  useEffect(() => {
    if (isAutoPlay && gameOverCounts === aiPlayers.length) {
      // 모든 게임이 종료되었고 자동 재생이 활성화된 경우
      geneticAlgorithm.nextGeneration();
      setCurrentGeneration(geneticAlgorithm.generation + 1); // 세대 업데이트
      setAiPlayers([...geneticAlgorithm.population]); // 새로운 세대의 AI 플레이어 설정
      setGameOverCounts(0); // 게임 종료 카운트 초기화
    } else {
      console.log(isAutoPlay, gameOverCounts, aiPlayers.length)
    }
  }, [gameOverCounts, isAutoPlay, aiPlayers.length, geneticAlgorithm]);

  // 자동 재생 토글 함수
  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev);
  };

  return (
    <div className="game">
      <h1>블록 맞추기 게임</h1>
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
          />
        ))}
      </div>
    </div>
  );
}

export default Game;
