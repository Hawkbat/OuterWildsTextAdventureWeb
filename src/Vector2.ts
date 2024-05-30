
export class Vector2
{
  x: number;
  y: number;

  constructor()
  constructor(x: number, y: number)
  constructor(vec: Vector2)
  constructor(vecOrX?: Vector2 | number, y?: number) {
    this.x = vecOrX instanceof Vector2 ? vecOrX.x : typeof vecOrX === 'number' ? vecOrX : 0
    this.y = vecOrX instanceof Vector2 ? vecOrX.y : typeof y === 'number' ? y : 0
  }

  assign(vec: Vector2): void
  {
    this.x = vec.x;
    this.y = vec.y;
  }
  
  toString(): string{
    return "(" + this.x + ", " + this.y + ")";
  }
  
  dist(v: Vector2): number{
    return v.sub(this).magnitude();
  }
  
  add(v: Vector2): Vector2{
    return new Vector2(this.x + v.x, this.y + v.y);
  }
  
  sub(v: Vector2): Vector2{
    return new Vector2(this.x - v.x, this.y - v.y);
  }
  
  mult(value: number): Vector2{
    return new Vector2(this.x * value, this.y * value);
  }
  
  scale(value: number): Vector2{
    this.x *= value;
    this.y *= value;
    return this;
  }
  
  magnitude(): number{
    return Math.max(Math.sqrt(this.x*this.x+this.y*this.y), 0.001);
  }
  
  normalize(): Vector2{
    const mag: number = this.magnitude();
    this.x /= mag;
    this.y /= mag;
    return this;
  }
  
  normalized(): Vector2{
    const mag: number = this.magnitude();
    return new Vector2(this.x/mag, this.y/mag);
  }
  
  theta(): number{
    return Math.atan2(this.y, this.x);
  }
  
  dx(): number{
    return this.x/this.magnitude();
  }
  
  dy(): number{
    return this.y/this.magnitude();
  }
  
  leftNormal(): Vector2{
    return new Vector2(this.y,-this.x);
  }
  rightNormal(): Vector2{
    return new Vector2(-this.y,this.x);
  }
  
  dot(v1: Vector2): number{
    return(this.x * v1.x + this.y * v1.y);
  }
  
  scaledDot(v1: Vector2): number{
    return(this.x * v1.dx() + this.y * v1.dy());
  }
  
  projectOnto(v2: Vector2): Vector2{
    const dot: number = this.scaledDot(v2);
    return new Vector2(dot * v2.dx(), dot * v2.dy());
  }
}