import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import Block from './Block';
import {
  generateBlocks,
  checkGameOver,
  placeBlockOnBoard,
  checkAndMarkLines,
} from './utils';

function GameInstance({ aiPlayer, isAutoPlay, onGameOver }) {
  const initialBoard = Array(8).fill(null).map(() => Array(8).fill(0));

  const [board, setBoard] = useState(initialBoard);
  const [currentBlocks, setCurrentBlocks] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Refs to hold the latest state values
  const boardRef = useRef(board);
  const currentBlocksRef = useRef(currentBlocks);
  const scoreRef = useRef(score);
  const gameOverRef = useRef(gameOver);
  const aiPlayerRef = useRef(aiPlayer);

  const intervalRef = useRef(null);

  // Update refs whenever state changes
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    currentBlocksRef.current = currentBlocks;
  }, [currentBlocks]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    aiPlayerRef.current = aiPlayer;
  }, [aiPlayer]);

  // 게임 초기화
  useEffect(() => {
    setBoard(initialBoard);
    const startingBlocks = generateBlocks(3);
    setCurrentBlocks(startingBlocks);
    setScore(0);
    setGameOver(false);
    if (aiPlayerRef.current) {
      aiPlayerRef.current.gameOver = false;
      aiPlayerRef.current.setFitness(0);
    }
    console.log('게임이 초기화되었습니다.');
  }, [aiPlayer]);

  // AI 플레이 루프 설정
  useEffect(() => {
    if (!isAutoPlay || gameOver) return;

    if (!aiPlayerRef.current) {
      console.log('AI 플레이어가 존재하지 않습니다.');
      return;
    }

    if (aiPlayerRef.current.gameOver) {
      console.log('AI 플레이어가 이미 게임 오버 상태입니다.');
      return;
    }

    if (intervalRef.current) {
      // 이미 AI 플레이 루프가 동작 중인 경우
      console.log("ABC")
      return;
    }

    console.log('AI 플레이 루프를 시작합니다.');

    intervalRef.current = setInterval(async () => {
      if (
        !isAutoPlay ||
        gameOverRef.current ||
        !aiPlayerRef.current ||
        aiPlayerRef.current.gameOver
      ) {
        if (gameOverRef.current) {
          console.log('게임이 종료되어 AI 플레이 루프를 중지합니다.');
        } else if (!aiPlayerRef.current) {
          console.log('AI 플레이어가 존재하지 않아 AI 플레이 루프를 중지합니다.');
        } else if (aiPlayerRef.current.gameOver) {
          console.log('AI 플레이어가 게임 오버 상태여서 AI 플레이 루프를 중지합니다.');
        }
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      const currentBoard = boardRef.current;
      const blocks = currentBlocksRef.current;
      const currentScore = scoreRef.current;

      const action = aiPlayerRef.current.getAction(currentBoard, blocks);

      if (action) {
        const { blockIndex, position } = action;
        const block = blocks[blockIndex];
        const { rowIndex, colIndex } = position;

        const result = placeBlockOnBoard(currentBoard, block, rowIndex, colIndex);

        let updatedBoard;

        if (result) {
          const { newBoard } = result;
          updatedBoard = newBoard;

          // 라인 검사 및 점수 처리
          const { markedBoard, linesCleared, blocksCleared } = checkAndMarkLines(updatedBoard);

          if (linesCleared > 0) {
            updatedBoard = removeMarkedCells(markedBoard);
            setBoard(updatedBoard);

            // 점수 업데이트
            const gainedScore = blocksCleared * (linesCleared > 1 ? linesCleared : 1);
            setScore((prevScore) => prevScore + gainedScore);
            aiPlayerRef.current.addScore(gainedScore);
            console.log(`라인이 ${linesCleared}개 제거되어 점수 ${gainedScore}점 획득.`);
          } else {
            setBoard(updatedBoard);
          }

          // 사용한 블록 제거
          setCurrentBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(blockIndex, 1);
            return newBlocks;
          });
          console.log(`블록 인덱스 ${blockIndex}를 배치했습니다.`);
        } else {
          // 블록을 배치할 수 없으면 블록 제거
          setCurrentBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(blockIndex, 1);
            return newBlocks;
          });
          console.log(`블록 인덱스 ${blockIndex}를 배치할 수 없어 제거했습니다.`);
        }

        // 남은 블록이 없으면 새로운 블록 생성 또는 게임 오버 검사
        let shouldGenerateNewBlocks = false;
        setCurrentBlocks((prevBlocks) => {
          if (prevBlocks.length === 0) {
            shouldGenerateNewBlocks = true;
          }
          console.log("남은 블록이 없어서 게임오버.")
          return prevBlocks;
        });

        if (shouldGenerateNewBlocks) {
          const newBlocks = generateBlocks(3);
          const latestBoard = updatedBoard || currentBoard; // 최신 보드 사용
          if (checkGameOver(latestBoard, newBlocks)) {
            // 게임 오버 처리
            setGameOver(true);
            if (aiPlayerRef.current) {
              aiPlayerRef.current.gameOver = true;
            }
            console.log('게임 오버 조건을 만족하여 게임을 종료합니다.');
            onGameOver(currentScore);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          } else {
            setCurrentBlocks(newBlocks);
            console.log('새로운 블록을 생성했습니다.');
          }
        }
      } else {
        // 가능한 액션이 없을 경우 현재 블록들을 모두 제거하고 새로운 블록 생성
        setCurrentBlocks([]);
        console.log('가능한 액션이 없어 모든 블록을 제거합니다.');

        const newBlocks = generateBlocks(3);
        if (checkGameOver(boardRef.current, newBlocks)) {
          // 게임 오버 처리
          setGameOver(true);
          if (aiPlayerRef.current) {
            aiPlayerRef.current.gameOver = true;
          }
          console.log('게임 오버 조건을 만족하여 게임을 종료합니다.');
          onGameOver(scoreRef.current);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          setCurrentBlocks(newBlocks);
          console.log('새로운 블록을 생성했습니다.');
        }
      }
    }, 5); // AI 동작 간 간격을 100ms로 설정 (필요에 따라 조정 가능)

    // 컴포넌트 언마운트 시 플레이 루프 중지
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('컴포넌트 언마운트 시 AI 플레이 루프를 중지했습니다.');
      }
    };
  }, [isAutoPlay, gameOver, onGameOver]);

  const removeMarkedCells = (markedBoard) => {
    return markedBoard.map((row) =>
      row.map((cell) => (cell === -1 ? 0 : cell))
    );
  };

  return (
    <div className="game-instance">
      <Board board={board} />
      <h4>점수: {score}</h4>
      <div className="blocks">
        {currentBlocks.map((block, index) => (
          <Block
            key={index}
            block={block}
            blockIndex={index}
            isSelected={false}
            onSelectBlock={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

export default GameInstance;
