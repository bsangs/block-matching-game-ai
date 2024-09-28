import React from 'react';

function Board({ board, onBoardClick, lastPlacedCells }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="board-row">
          {row.map((cell, colIndex) => {
            let className = 'board-cell';
            if (cell === 1) {
              className += ' filled';
            } else if (cell === 2) {
              className += ' last-placed';
            } else if (cell === -1) {
              className += ' to-be-cleared';
            }
            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={className}
                onClick={() => onBoardClick(rowIndex, colIndex)}
              ></div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Board;
