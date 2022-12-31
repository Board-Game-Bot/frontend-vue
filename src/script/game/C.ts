class C {
  static distance(pos1: IPosition, pos2: IPosition) {
    const dr = pos1.x - pos2.x;
    const dc = pos1.y - pos2.y;
    return Math.sqrt(dr * dr + dc * dc);
  }

  static spdShift(p1: IPosition, p2: IPosition, t: number): {a: number, v: number} {
    const d = this.distance(p1, p2);
    return {
      v: 2 * d / t,
      a: 2 * d / (t * t),
    };
  }
}

class Vector {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(vec: Vector) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  public sub(vec: Vector) {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }

  public rot(deg: number) {
    const {x, y} = this;
    const {
      nx,
      ny
    } = {
      nx: x * Math.cos(deg) + y * Math.sin(deg),
      ny: -x * Math.sin(deg) + y * Math.cos(deg)
    };
    this.x = nx;
    this.y = ny;
    return this;
  }

  public mul(n: number) {
    this.x *= n;
    this.y *= n;
    return this;
  }
}

export type IPosition = {
  x: number;
  y: number;
};

export { Vector };

export default C;