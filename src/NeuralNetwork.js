class NeuralNetwork {
    constructor(inputSize, hiddenSizes, outputSize) {
      this.layers = [];
      let previousSize = inputSize;
      for (let size of hiddenSizes) {
        this.layers.push(this.createLayer(previousSize, size));
        previousSize = size;
      }
      this.layers.push(this.createLayer(previousSize, outputSize));
    }
  
    createLayer(inputSize, outputSize) {
      const layer = [];
      for (let i = 0; i < outputSize; i++) {
        const weights = [];
        for (let j = 0; j < inputSize; j++) {
          weights.push(Math.random() * 2 - 1); // -1 ~ 1 사이의 값
        }
        layer.push({
          weights,
          bias: Math.random() * 2 - 1,
        });
      }
      return layer;
    }
  
    predict(inputs) {
      let outputs = inputs;
      for (let layer of this.layers) {
        outputs = this.feedForward(outputs, layer);
      }
      return outputs;
    }
  
    feedForward(inputs, layer) {
      const outputs = [];
      for (let neuron of layer) {
        let sum = neuron.bias;
        for (let i = 0; i < neuron.weights.length; i++) {
          sum += neuron.weights[i] * inputs[i];
        }
        outputs.push(this.activation(sum));
      }
      return outputs;
    }
  
    activation(x) {
      // ReLU 함수 사용
      return x > 0 ? x : 0;
    }
  
    static crossover(parentA, parentB) {
      const child = new NeuralNetwork(0, [], 0);
      child.layers = [];
      for (let i = 0; i < parentA.layers.length; i++) {
        const layerA = parentA.layers[i];
        const layerB = parentB.layers[i];
        const newLayer = [];
        for (let j = 0; j < layerA.length; j++) {
          const neuronA = layerA[j];
          const neuronB = layerB[j];
          const newNeuron = {
            weights: [],
            bias: Math.random() < 0.5 ? neuronA.bias : neuronB.bias,
          };
          for (let k = 0; k < neuronA.weights.length; k++) {
            newNeuron.weights.push(
              Math.random() < 0.5 ? neuronA.weights[k] : neuronB.weights[k]
            );
          }
          newLayer.push(newNeuron);
        }
        child.layers.push(newLayer);
      }
      return child;
    }
  
    mutate(rate) {
      for (let layer of this.layers) {
        for (let neuron of layer) {
          if (Math.random() < rate) {
            neuron.bias += Math.random() * 0.2 - 0.1;
          }
          for (let i = 0; i < neuron.weights.length; i++) {
            if (Math.random() < rate) {
              neuron.weights[i] += Math.random() * 0.2 - 0.1;
            }
          }
        }
      }
    }
  }
  
  export default NeuralNetwork;
  