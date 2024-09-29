import React, { useState, useEffect, useCallback } from 'react';
import GameInstance from './GameInstance';
import GeneticAlgorithm from './GeneticAlgorithm';
import GenerationInfo from './GenerationInfo';
import './index.css';

function Game() {
  const [geneticAlgorithm, setGeneticAlgorithm] = useState(null);
  const [currentGeneration, setCurrentGeneration] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  
  // 새로운 상태 변수 추가
  const [prevMinScore, setPrevMinScore] = useState(null);
  const [prevAvgScore, setPrevAvgScore] = useState(null);
  const [scores, setScores] = useState([]);

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [aiPlayers, setAiPlayers] = useState([]);
  const [gameOverStatus, setGameOverStatus] = useState({}); // 각 플레이어의 게임 오버 상태를 추적

  // 초기 유전 알고리즘 설정
  useEffect(() => {
    const ga = new GeneticAlgorithm(50); // 50개의 유전자
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

    // 점수를 scores 배열에 저장
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[index] = score;
      return newScores;
    });
  }, []);

  // 게임 재시작을 관리하는 useEffect
  useEffect(() => {
    if (isAutoPlay && Object.keys(gameOverStatus).length === aiPlayers.length && aiPlayers.length > 0) {
      // 모든 게임이 종료되었고 자동 재생이 활성화된 경우

      // 이전 세대의 최소 점수와 평균 점수 계산
      const currentScores = aiPlayers.map((player, index) => scores[index] || 0);
      const currentMin = Math.min(...currentScores);
      const currentAvg = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;

      // 상태 업데이트
      setPrevMinScore(currentMin);
      setPrevAvgScore(currentAvg);

      geneticAlgorithm.nextGeneration();
      setCurrentGeneration(geneticAlgorithm.generation + 1); // 세대 업데이트
      setAiPlayers([...geneticAlgorithm.population]); // 새로운 세대의 AI 플레이어 설정
      setBestScore(prevBest => Math.max(prevBest, ...currentScores));
      setGameOverStatus({}); // 게임 오버 상태 초기화
      setScores([]); // 점수 초기화
    } else {
      console.log(isAutoPlay, gameOverStatus, aiPlayers.length);
    }
  }, [gameOverStatus, isAutoPlay, aiPlayers.length, geneticAlgorithm, scores]);

  // 자동 재생 토글 함수
  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
    if (!isAutoPlay) {
      setGameOverStatus({}); // 자동 재생 시작 시 상태 초기화
      setScores([]); // 점수 초기화
      setPrevMinScore(null); // 이전 최소 점수 초기화
      setPrevAvgScore(null); // 이전 평균 점수 초기화
    }
  };

  return (
    <div className="game">
      <GenerationInfo 
        generation={currentGeneration} 
        bestScore={bestScore} 
        minScore={prevMinScore} 
        avgScore={prevAvgScore} 
      />
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
