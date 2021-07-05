import { Injectable } from '@angular/core';
import { IFigure } from '../../figure/components/figure/figure.component';
import { FIELD_SIZE, POINTS } from '../../../constants';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() {
  }

  valid(f: IFigure): boolean {
    return this.insideWalls(f.x) && this.insideWalls(f.y);
  }


  insideWalls(value: number): boolean {
    return value >= 0 && value < FIELD_SIZE;
  }

  scorePoints(value: number, bonus: number = 1): number {
    const points =
      value === 6
        ? POINTS.CARROT
        : value === 7
        ? POINTS.APPLE
        : 0;
    console.log('Добавил:', bonus * points);
    return bonus * points;
  }

  // Проверяет стоит ли закончить игру если игрок вернулся в дом и собрал хоть что-то
  finishTheGame(f: IFigure, points: number): boolean {
    return f.x === f.spawnPositionX && f.y === f.spawnPositionY && points > 0;
  }

  uniteHomeAndGardener(f: IFigure): boolean {
    return f.x === f.spawnPositionX && f.y === f.spawnPositionY;
  }
}
