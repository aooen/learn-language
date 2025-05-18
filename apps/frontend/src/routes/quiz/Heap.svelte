<script lang="ts">
    export type Quiz = {
  id: number;
  front: string;
  back: string;
  progress: number;
  sentence_from: string;
  due: number; // timestamp
};

    export class MinHeap {
      private heap: Quiz[] = [];
    
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

</script>
