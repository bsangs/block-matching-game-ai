import React from 'react';

function Block({ block, blockIndex, isSelected, onSelectBlock }) {
  const handleClick = () => {
    onSelectBlock(blockIndex);
  };

  return (
    <div
      className={`block ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {block.map((row, rowIndex) => (
        <div key={`block-row-${rowIndex}`} className="block-row">
          {row.map((cell, colIndex) => (
            <div
              key={`block-cell-${rowIndex}-${colIndex}`}
              className={`block-cell ${cell ? 'filled' : ''}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Block;
