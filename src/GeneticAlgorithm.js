import NeuralNetwork from './NeuralNetwork';
import { canPlaceBlock } from './utils';

class GeneticAlgorithm {
  constructor(populationSize = 20) { // 인구 크기 증가
    this.populationSize = populationSize;
    this.population = [];
    this.generation = 1;

    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(new AIPlayer());
    }
  }

  nextGeneration() {
    this.evaluateFitness();
    this.selection();
    const offspring = this.crossover();
    this.mutation(offspring);
    this.population = this.population.concat(offspring);
    this.generation++;
    // 각 AIPlayer의 gameOver 플래그와 fitness 초기화
    this.population.forEach((ai) => {
      ai.gameOver = false;
      ai.fitness = 0;
    });
  }

  evaluateFitness() {
    // AIPlayer 인스턴스에서 이미 fitness를 설정함
  }

  selection() {
    // 상위 20% 개체 선택
    const retainRate = 0.2; // 20% 유지 (인구 크기가 20이면 상위 4개 유지)
    const retainLength = Math.floor(this.populationSize * retainRate);
    this.population.sort((a, b) => b.fitness - a.fitness);
    this.population = this.population.slice(0, retainLength);
  }

  crossover() {
    const offspring = [];
    while (this.population.length + offspring.length < this.populationSize) {
      const parentA = this.randomSelection();
      const parentB = this.randomSelection();
      const childNetwork = NeuralNetwork.crossover(parentA.network, parentB.network);
      offspring.push(new AIPlayer(childNetwork));
    }
    return offspring;
  }

  // 부모 개체를 무작위로 선택하는 함수
  randomSelection() {
    const index = Math.floor(Math.random() * this.population.length);
    return this.population[index];
  }

  mutation(offspring) {
    for (let ai of offspring) {
      ai.network.mutate(0.3); // 돌연변이 확률을 낮게 설정
    }
  }
}


class AIPlayer {
  constructor(network = null) {
    this.network =
      network ||
      new NeuralNetwork(64 + 3 * 64, [128, 64], 3 * 64); // 입력, 은닉층, 출력 노드 수 조정
    this.fitness = 0;
    this.gameOver = false;
  }

  getAction(board, blocks) {
    // 입력 데이터 생성
    const input = this.createInput(board, blocks);
    // 신경망을 통해 출력 계산
    const output = this.network.predict(input);
    // 출력 해석하여 행동 결정
    const action = this.parseOutput(output, blocks, board);
    return action;
  }

  createInput(board, blocks) {
    // 보드를 0과 1의 배열로 변환
    const boardInput = board.flat().map((cell) => (cell > 0 ? 1 : 0));
    // 블록들을 가능한 위치에 배치한 배열 생성
    const blockInputs = [];
    for (let block of blocks) {
      const blockPlacements = this.getBlockPlacements(block, board);
      blockInputs.push(blockPlacements);
    }
    const input = boardInput.concat(...blockInputs);
    return input;
  }

  getBlockPlacements(block, board) {
    const placements = [];
    for (let row = 0; row <= 8 - block.length; row++) {
      for (let col = 0; col <= 8 - block[0].length; col++) {
        placements.push(canPlaceBlock(board, block, row, col) ? 1 : 0);
      }
    }
    return placements;
  }

  parseOutput(output, blocks, board) {
    // 가능한 행동 중에서 출력값이 가장 높은 것을 선택
    const actions = [];
    let index = 0;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex];
      for (let row = 0; row <= 8 - block.length; row++) {
        for (let col = 0; col <= 8 - block[0].length; col++) {
          if (canPlaceBlock(board, block, row, col)) {
            actions.push({
              blockIndex,
              position: { rowIndex: row, colIndex: col },
              value: output[index],
            });
          }
          index++;
        }
      }
    }

    if (actions.length === 0) {
      return null;
    }

    // value가 가장 큰 액션 선택
    actions.sort((a, b) => b.value - a.value);
    return actions[0];
  }

  addScore(score) {
    this.fitness += score;
  }

  setFitness(score) {
    this.fitness = score;
  }
}

export default GeneticAlgorithm;
