import React from 'react';

function GenerationInfo({ generation, bestScore, minScore, avgScore }) {
  return (
    <div className="generation-info">
      <h2>세대: {generation}</h2>
      <h2>최고 점수: {bestScore}</h2>
      {/* 이전 세대의 최소 점수와 평균 점수를 조건부로 표시 */}
      {minScore !== null && (
        <h2>이전 세대 최소 점수: {minScore}</h2>
      )}
      {avgScore !== null && (
        <h2>이전 세대 평균 점수: {avgScore.toFixed(2)}</h2>
      )}
    </div>
  );
}

export default GenerationInfo;
