import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import Block from './Block';
import {
  generateBlocks,
  checkGameOver,
  placeBlockOnBoard,
  checkAndMarkLines,
} from './utils';

function GameInstance({ aiPlayer, isAutoPlay, onGameOver, index }) {
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
  }, [aiPlayer]);

  useEffect(() => {
    if (gameOver) {
      onGameOver(scoreRef.current)
      console.log(`[${index}] GO`)
    } else {
      console.log(`${index} NGO`)
    }
  }, [gameOver])

  // AI 플레이 루프 설정
  useEffect(() => {
    if (!isAutoPlay || gameOver) return;

    if (!aiPlayerRef.current) {
      return;
    }

    if (aiPlayerRef.current.gameOver) {
      return;
    }

    if (intervalRef.current) {
      // 이미 AI 플레이 루프가 동작 중인 경우
      return;
    }


    intervalRef.current = setInterval(async () => {
      if (
        !isAutoPlay ||
        gameOverRef.current ||
        !aiPlayerRef.current ||
        aiPlayerRef.current.gameOver
      ) {

        // onGameOver 호출 추가: 게임 오버 상태에서 루프를 중지할 때 onGameOver 호출
        if (gameOverRef.current || (aiPlayerRef.current && aiPlayerRef.current.gameOver)) {
          onGameOver(scoreRef.current);
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
          } else {
            setBoard(updatedBoard);
          }

          // 사용한 블록 제거
          setCurrentBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(blockIndex, 1);
            return newBlocks;
          });
        } else {
          // 블록을 배치할 수 없으면 블록 제거
          setCurrentBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(blockIndex, 1);
            return newBlocks;
          });
        }

        // 남은 블록이 없으면 새로운 블록 생성 또는 게임 오버 검사
        let shouldGenerateNewBlocks = false;
        setCurrentBlocks((prevBlocks) => {
          if (prevBlocks.length === 0) {
            shouldGenerateNewBlocks = true;
          }
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

            clearInterval(intervalRef.current);
            intervalRef.current = null;
          } else {
            setCurrentBlocks(newBlocks);
          }
        }
      } else {
        // 가능한 액션이 없을 경우 현재 블록들을 모두 제거하고 새로운 블록 생성
        setCurrentBlocks([]);

        const newBlocks = generateBlocks(3);
        if (checkGameOver(boardRef.current, newBlocks)) {
          // 게임 오버 처리
          setGameOver(true);
          if (aiPlayerRef.current) {
            aiPlayerRef.current.gameOver = true;
          }

          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          setCurrentBlocks(newBlocks);
        }
      }
    }, 1);

    // 컴포넌트 언마운트 시 플레이 루프 중지
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
      <p>{gameOver.toString()}</p>
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
