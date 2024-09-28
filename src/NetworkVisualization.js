import React from 'react';

function NetworkVisualization({ network }) {
  const layerPositions = [];
  const layerSpacing = 100; // 레이어 간 간격 축소
  const neuronSpacing = 20; // 뉴런 간 간격 축소
  let maxNeurons = 0;

  network.layers.forEach((layer, i) => {
    const x = i * layerSpacing + 50; // 시작 좌표 조정
    const yOffset = (layer.length * neuronSpacing) / 2 - neuronSpacing / 2;
    const neurons = layer.map((_, j) => ({
      x,
      y: j * neuronSpacing - yOffset
    }));
    layerPositions.push(neurons);
    if (layer.length > maxNeurons) {
      maxNeurons = layer.length;
    }
  });

  const width = network.layers.length * layerSpacing + 100;
  const height = maxNeurons * neuronSpacing + 100;

  return (
    <div className="network-visualization">
      <h3>신경망 구조</h3>
      <svg width={width} height={height}>
        {/* 연결선 그리기 */}
        {network.layers.map((layer, layerIndex) => {
          if (layerIndex === 0) return null;
          const prevLayer = network.layers[layerIndex - 1];
          return layer.map((neuron, neuronIndex) => {
            const { x: x1, y: y1 } = layerPositions[layerIndex][neuronIndex];
            return prevLayer.map((_, prevNeuronIndex) => {
              const { x: x2, y: y2 } = layerPositions[layerIndex - 1][prevNeuronIndex];
              const weight = neuron.weights[prevNeuronIndex];
              const color = weight > 0 ? 'rgba(0, 123, 255, 0.5)' : 'rgba(220, 53, 69, 0.5)';
              return (
                <line
                  key={`${layerIndex}-${neuronIndex}-${prevNeuronIndex}`}
                  x1={x2 + 25} // 뉴런 반지름 조정에 맞춰 위치 수정
                  y1={y2 + 25}
                  x2={x1 + 25}
                  y2={y1 + 25}
                  stroke={color}
                  strokeWidth={1}
                />
              );
            });
          });
        })}
        {/* 뉴런 그리기 */}
        {layerPositions.map((layer, layerIndex) =>
          layer.map((neuron, neuronIndex) => (
            <circle
              key={`${layerIndex}-${neuronIndex}`}
              cx={neuron.x + 25}
              cy={neuron.y + 25}
              r={8} // 반지름 축소
              className="neuron"
            />
          ))
        )}
      </svg>
    </div>
  );
}

export default NetworkVisualization;
