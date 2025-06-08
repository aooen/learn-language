import { client } from '$lib/utils/api';

export type Quiz = Awaited<
  ReturnType<Awaited<ReturnType<(typeof client.quizSet)[':id']['$get']>>['json']>
>[number];

export class MinHeap {
  heap: Quiz[] = $state([]);

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  push(quiz: Quiz): void {
    this.heap.push(quiz);
    this.heapifyUp();
  }

  pop(): Quiz | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop() || null;

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown();
    return root;
  }

  peek(): Quiz | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (
      this.getParentIndex(index) >= 0 &&
      this.heap[this.getParentIndex(index)].due > this.heap[index].due
    ) {
      this.swap(index, this.getParentIndex(index));
      index = this.getParentIndex(index);
    }
  }

  private heapifyDown(): void {
    let index = 0;
    const length = this.heap.length;
    while (this.getLeftChildIndex(index) < length) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      const rightChildIndex = this.getRightChildIndex(index);

      if (
        rightChildIndex < length &&
        this.heap[rightChildIndex].due < this.heap[smallerChildIndex].due
      ) {
        smallerChildIndex = rightChildIndex;
      }

      if (this.heap[index].due <= this.heap[smallerChildIndex].due) break;

      this.swap(index, smallerChildIndex);
      index = smallerChildIndex;
    }
  }
}

export class ButtonType {
  // Defining ButtonTypes Enum
  static readonly Again = new ButtonType('again', 'Again', 1, 0);
  static readonly Hard = new ButtonType('hard', 'Hard', 6, 3);
  static readonly Good = new ButtonType('good', 'Good', 10, 10);
  static readonly Easy = new ButtonType('easy', 'Easy', 1440, 30);

  public readonly name: string;
  public readonly label: string;
  public readonly later: number;
  public readonly progress: number;

  private constructor(name: string, label: string, later: number, progress: number) {
    this.name = name;
    this.label = label;
    this.later = later;
    this.progress = progress;
  }

  toString(): string {
    return this.label;
  }

  static values(): ButtonType[] {
    return [ButtonType.Again, ButtonType.Hard, ButtonType.Good, ButtonType.Easy];
  }

  static fromString(label: string): ButtonType | undefined {
    return ButtonType.values().find((btn) => btn.label === label);
  }

  static readonly labelMap: Map<string, ButtonType> = new Map(
    ButtonType.values().map((btn) => [btn.label, btn]),
  );

  static fromLabel(label: string): ButtonType | undefined {
    return this.labelMap.get(label);
  }
}
