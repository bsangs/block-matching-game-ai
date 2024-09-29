import NeuralNetwork from './NeuralNetwork';
import { canPlaceBlock } from './utils';

class GeneticAlgorithm {
  constructor(populationSize = 10) {
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
    this.crossover();
    this.mutation();
    this.generation++;
    // 새로운 세대를 위해 각 AIPlayer의 gameOver 플래그와 fitness를 초기화
    this.population.forEach((ai) => {
      ai.gameOver = false;
      ai.fitness = 0;
    });
  }

  evaluateFitness() {
    // AIPlayer 인스턴스에서 이미 fitness를 설정함
  }

  selection() {
    // 상위 2개 유전자 선택
    this.population.sort((a, b) => b.fitness - a.fitness);
    this.population = this.population.slice(0, 2);
  }

  crossover() {
    const offspring = [];
    while (this.population.length + offspring.length < this.populationSize) {
      const parentA = this.population[0];
      const parentB = this.population[1];
      const childNetwork = NeuralNetwork.crossover(parentA.network, parentB.network);
      offspring.push(new AIPlayer(childNetwork));
    }
    this.population = this.population.concat(offspring);
  }

  mutation() {
    for (let ai of this.population) {
      ai.network.mutate(0.1); // 돌연변이 확률 조정 가능
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
