import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
  } from 'react';
  import Board from './Board';
  import Block from './Block';
  import {
    generateBlocks,
    checkGameOver,
    placeBlockOnBoard,
    checkAndMarkLines,
  } from './utils';
  import GeneticAlgorithm from './GeneticAlgorithm';
  import GenerationInfo from './GenerationInfo';
  import NetworkVisualization from './NetworkVisualization';
  
  function Game() {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0));
  
    const [board, setBoard] = useState(initialBoard);
    const [currentBlocks, setCurrentBlocks] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState(null);
    const [lastPlacedCells, setLastPlacedCells] = useState([]);
    const [clearing, setClearing] = useState(false);
  
    // 유전 알고리즘 관련 상태
    const [geneticAlgorithm, setGeneticAlgorithm] = useState(null);
    const [currentGeneration, setCurrentGeneration] = useState(1);
    const [bestScore, setBestScore] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
  
    // Refs for the latest state
    const boardRef = useRef(board);
    const currentBlocksRef = useRef(currentBlocks);
    const gameOverRef = useRef(gameOver);
    const geneticAlgorithmRef = useRef(geneticAlgorithm);
    const scoreRef = useRef(score);
    const bestScoreRef = useRef(bestScore);
    const isAutoPlayRef = useRef(isAutoPlay);
  
    const intervalRef = useRef(null);
  
    // Sync refs with state
    useEffect(() => {
      boardRef.current = board;
    }, [board]);
  
    useEffect(() => {
      currentBlocksRef.current = currentBlocks;
    }, [currentBlocks]);
  
    useEffect(() => {
      gameOverRef.current = gameOver;
    }, [gameOver]);
  
    useEffect(() => {
      geneticAlgorithmRef.current = geneticAlgorithm;
    }, [geneticAlgorithm]);
  
    useEffect(() => {
      scoreRef.current = score;
    }, [score]);
  
    useEffect(() => {
      bestScoreRef.current = bestScore;
    }, [bestScore]);
  
    useEffect(() => {
      isAutoPlayRef.current = isAutoPlay;
    }, [isAutoPlay]);
  
    // 초기 게임 설정
    useEffect(() => {
      setCurrentBlocks(generateBlocks(3));
      const ga = new GeneticAlgorithm();
      setGeneticAlgorithm(ga);
    }, []);
  
    // 새로운 블록 생성 또는 게임 오버 체크
    useEffect(() => {
      if (
        currentBlocks.length === 0 &&
        !gameOver &&
        !isAutoPlayRef.current
      ) {
        const newBlocks = generateBlocks(3);
        if (checkGameOver(boardRef.current, newBlocks)) {
          setGameOver(true);
        } else {
          setCurrentBlocks(newBlocks);
        }
      }
    }, [currentBlocks, board, gameOver]);
  
    // aiPlay 함수 최적화 및 변경 사항 반영
    const aiPlay = useCallback(() => {
      const ga = geneticAlgorithmRef.current;
      if (!ga) return;
  
      const ai = ga.getCurrentAI();
      const action = ai.getAction(
        boardRef.current,
        currentBlocksRef.current
      );
      if (action) {
        const { blockIndex, position } = action;
        const block = currentBlocksRef.current[blockIndex];
        const { rowIndex, colIndex } = position;
        const result = placeBlockOnBoard(
          boardRef.current,
          block,
          rowIndex,
          colIndex
        );
        if (result) {
          const { newBoard, placedCells } = result;
          setBoard(newBoard);
          setLastPlacedCells(placedCells);
  
          const {
            markedBoard,
            linesCleared,
            blocksCleared,
          } = checkAndMarkLines(newBoard);
  
          // isAutoPlay가 아닐 때만 시각적 효과 적용
          if (linesCleared > 0) {
            if (!isAutoPlayRef.current) {
              setClearing(true);
              setBoard(markedBoard);
              setTimeout(() => {
                const clearedBoard = removeMarkedCells(markedBoard);
                setBoard(clearedBoard);
                const gainedScore =
                  blocksCleared *
                  (linesCleared > 1 ? linesCleared : 1);
                setScore((prevScore) => prevScore + gainedScore);
                ai.addScore(gainedScore);
                setClearing(false);
              }, 500);
            } else {
              // isAutoPlay일 때 시각적 효과 없이 바로 점수 업데이트
              const clearedBoard = removeMarkedCells(markedBoard);
              setBoard(clearedBoard);
              const gainedScore =
                blocksCleared * (linesCleared > 1 ? linesCleared : 1);
              setScore((prevScore) => prevScore + gainedScore);
              ai.addScore(gainedScore);
            }
          }
  
          // 배치한 블록 제거
          const newBlocks = [...currentBlocksRef.current];
          newBlocks.splice(blockIndex, 1);
          setCurrentBlocks(newBlocks);
          setSelectedBlockIndex(null);
  
          // 모든 블록 소진 시 새로운 블록 생성 또는 게임 오버 체크
          if (newBlocks.length === 0) {
            const moreBlocks = generateBlocks(3);
            if (checkGameOver(newBoard, moreBlocks)) {
              setGameOver(true);
              ai.setFitness(scoreRef.current);
              if (scoreRef.current > bestScoreRef.current) {
                setBestScore(scoreRef.current);
              }
            } else {
              setCurrentBlocks(moreBlocks);
            }
          }
        } else {
          // 배치 불가 시 게임 오버
          setGameOver(true);
          ai.setFitness(scoreRef.current);
          if (scoreRef.current > bestScoreRef.current) {
            setBestScore(scoreRef.current);
          }
        }
      } else {
        // 가능한 액션이 없을 경우 게임 오버 및 세대 갱신
        setGameOver(true);
        ga.currentIndex++;
        if (ga.currentIndex >= ga.populationSize) {
          ga.nextGeneration();
          setCurrentGeneration(ga.generation);
          ga.currentIndex = 0;
        }
      }
    }, []);
  
    // AutoPlay 설정 및 aiPlay 호출 간격 변경 (2ms)
    useEffect(() => {
      if (isAutoPlay && geneticAlgorithm) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
  
        intervalRef.current = setInterval(() => {
          if (!gameOverRef.current) {
            aiPlay();
          } else {
            // 세대 업데이트 및 게임 초기화
            geneticAlgorithmRef.current.nextGeneration();
            setCurrentGeneration(
              geneticAlgorithmRef.current.generation
            );
            setGameOver(false);
            setBoard(initialBoard);
            setScore(0);
            setCurrentBlocks(generateBlocks(3));
            setSelectedBlockIndex(null);
          }
        }, 2); // 2ms 간격으로 aiPlay 호출
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
  
      // 컴포넌트 언마운트 시 interval 정리
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [isAutoPlay, geneticAlgorithm, aiPlay]);
  
    const handleBlockSelect = (blockIndex) => {
      setSelectedBlockIndex(blockIndex);
    };
  
    const handleBoardClick = (rowIndex, colIndex) => {
      if (
        selectedBlockIndex === null ||
        gameOver ||
        clearing ||
        isAutoPlay
      ) {
        return;
      }
      const block = currentBlocks[selectedBlockIndex];
      const result = placeBlockOnBoard(board, block, rowIndex, colIndex);
      if (result) {
        const { newBoard, placedCells } = result;
        setBoard(newBoard);
        setLastPlacedCells(placedCells);
        const { markedBoard, linesCleared, blocksCleared } =
          checkAndMarkLines(newBoard);
        if (linesCleared > 0) {
          setClearing(true);
          setBoard(markedBoard);
          setTimeout(() => {
            const clearedBoard = removeMarkedCells(markedBoard);
            setBoard(clearedBoard);
            setScore(
              (prevScore) =>
                prevScore +
                blocksCleared *
                  (linesCleared > 1 ? linesCleared : 1)
            );
            setClearing(false);
          }, 500);
        } else {
          setScore((prevScore) => prevScore);
        }
        // 배치한 블록 제거
        const newBlocks = [...currentBlocks];
        newBlocks.splice(selectedBlockIndex, 1);
        setCurrentBlocks(newBlocks);
        setSelectedBlockIndex(null);
      } else {
        alert('해당 위치에 블록을 놓을 수 없습니다.');
      }
    };
  
    const removeMarkedCells = (markedBoard) => {
      return markedBoard.map((row) =>
        row.map((cell) => (cell === -1 ? 0 : cell))
      );
    };
  
    const toggleAutoPlay = () => {
      setIsAutoPlay((prev) => !prev);
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
          <button onClick={toggleAutoPlay}>
            {isAutoPlay ? '자동 플레이 중지' : '자동 플레이 시작'}
          </button>
          <GenerationInfo
            generation={currentGeneration}
            bestScore={bestScore}
          />
          {geneticAlgorithm && (
            <NetworkVisualization
              network={geneticAlgorithm.getCurrentAI().network}
            />
          )}
        </div>
      </div>
    );
  }
  
  export default Game;
  