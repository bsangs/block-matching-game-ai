import React from 'react';

function GenerationInfo({ generation, bestScore }) {
  return (
    <div className="generation-info">
      <h2>세대: {generation}</h2>
      <h2>최고 점수: {bestScore}</h2>
    </div>
  );
}

export default GenerationInfo;
