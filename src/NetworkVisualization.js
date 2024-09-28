import React from 'react';

function NetworkVisualization({ network }) {
  const layerPositions = [];
  const layerSpacing = 150;
  const neuronSpacing = 30;
  let maxNeurons = 0;

  for (let i = 0; i < network.layers.length; i++) {
    const layer = network.layers[i];
    const x = i * layerSpacing;
    const yOffset = (layer.length * neuronSpacing) / 2;
    const neurons = [];
    for (let j = 0; j < layer.length; j++) {
      const y = j * neuronSpacing - yOffset;
      neurons.push({ x, y });
    }
    layerPositions.push(neurons);
    if (layer.length > maxNeurons) {
      maxNeurons = layer.length;
    }
  }

  const width = network.layers.length * layerSpacing;
  const height = maxNeurons * neuronSpacing;

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
              const { x: x2, y: y2 } =
                layerPositions[layerIndex - 1][prevNeuronIndex];
              const weight =
                neuron.weights[prevNeuronIndex];
              const weightAbs = Math.abs(weight);
              const strokeWidth = Math.min(
                Math.max(weightAbs * 2, 0.5),
                5
              );
              const color = weight > 0 ? 'blue' : 'red';
              return (
                <line
                  key={`${layerIndex}-${neuronIndex}-${prevNeuronIndex}`}
                  x1={x2 + layerSpacing}
                  y1={y2 + height / 2}
                  x2={x1 + layerSpacing}
                  y2={y1 + height / 2}
                  stroke={color}
                  strokeWidth={strokeWidth}
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
              cx={neuron.x + layerSpacing}
              cy={neuron.y + height / 2}
              r={10}
              fill="white"
              stroke="black"
            />
          ))
        )}
      </svg>
    </div>
  );
}

export default NetworkVisualization;
