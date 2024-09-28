import React, { useState, useEffect } from 'react';
import Board from './Board';
import Block from './Block';
import {
  generateBlocks,
  checkGameOver,
  placeBlockOnBoard,
  checkAndMarkLines,
} from './utils';

function Game() {
  const [board, setBoard] = useState(
    Array(8).fill(null).map(() => Array(8).fill(0))
  );
  const [currentBlocks, setCurrentBlocks] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(null);
  const [lastPlacedCells, setLastPlacedCells] = useState([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    // 게임 시작 시 블록 3개 생성
    setCurrentBlocks(generateBlocks(3));
  }, []);

  useEffect(() => {
    // 블록을 모두 배치한 후 새로운 블록 생성 또는 게임 오버 체크
    if (currentBlocks.length === 0 && !gameOver) {
      const newBlocks = generateBlocks(3);
      if (checkGameOver(board, newBlocks)) {
        setGameOver(true);
      } else {
        setCurrentBlocks(newBlocks);
      }
    }
  }, [currentBlocks, board, gameOver]);

  const handleBlockSelect = (blockIndex) => {
    setSelectedBlockIndex(blockIndex);
  };

  const handleBoardClick = (rowIndex, colIndex) => {
    if (selectedBlockIndex === null || gameOver || clearing) {
      return;
    }
    const block = currentBlocks[selectedBlockIndex];
    const result = placeBlockOnBoard(
      board,
      block,
      rowIndex,
      colIndex
    );
    if (result) {
        const { newBoard, placedCells } = result;
      // 블록 배치 성공
      setBoard(newBoard);
      setLastPlacedCells(placedCells);
      const { markedBoard, linesCleared, blocksCleared } =
        checkAndMarkLines(newBoard);
      if (linesCleared > 0) {
        setClearing(true);
        setBoard(markedBoard);
        // 일정 시간 후에 라인 제거
        setTimeout(() => {
          const clearedBoard = removeMarkedCells(markedBoard);
          setBoard(clearedBoard);
          setScore(
            score + blocksCleared * (linesCleared > 1 ? linesCleared : 1)
          );
          setClearing(false);
        }, 500); // 0.5초 후에 제거
      } else {
        setScore(score);
      }
      // 배치한 블록 제거
      const newBlocks = [...currentBlocks];
      newBlocks.splice(selectedBlockIndex, 1);
      setCurrentBlocks(newBlocks);
      setSelectedBlockIndex(null);
    } else {
      // 블록 배치 실패
      alert('해당 위치에 블록을 놓을 수 없습니다.');
    }
  };

  const removeMarkedCells = (markedBoard) => {
    return markedBoard.map((row) =>
      row.map((cell) => (cell === -1 ? 0 : cell))
    );
  };

  return (
    <div className="game">
      <Board
        board={board}
        onBoardClick={handleBoardClick}
        lastPlacedCells={lastPlacedCells}
      />
      <div className="controls">
        <h2>점수: {score}</h2>
        {gameOver && <h2>게임 오버!</h2>}
        <div className="blocks">
          {currentBlocks.map((block, index) => (
            <Block
              key={index}
              block={block}
              blockIndex={index}
              isSelected={selectedBlockIndex === index}
              onSelectBlock={handleBlockSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Game;
