import { colorMap } from '../../../../constants';

export interface IFigure { // Всё что относится к игроку
  x: number; // Текущая позиция игрока по оси X
  y: number; // Текущая позиция игрока по оси y
  color: string; // Цвет квадрата
  spawnPositionX: number; // Позиция дома по оси X
  spawnPositionY: number; // Позиция дома по оси Y
}

export class Figure implements IFigure {
  x!: number;
  y!: number;
  color!: string;
  spawnPositionX!: number;
  spawnPositionY!: number;

  constructor(private ctx: CanvasRenderingContext2D) {
  }

  // Размещает игрока на поле
  spawn(size: number) {
    const x = Math.round(Math.random() * (size - 1));
    const y = Math.round(Math.random() * (size - 1));

    this.color = colorMap.homeWithGardener;
    this.x = x;
    this.y = y;
    this.spawnPositionX = x;
    this.spawnPositionY = y;
  }

  // Меняет позицию игрока при любом движении
  move(f: IFigure) {
    this.x = f.x;
    this.y = f.y;
    this.color = f.color;
  }

  // Рисует компонент на заданного цвета на заданной позиции
  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, 1, 1);
  }
}
