 // Heap Visualizer Class
 class HeapVisualizer {
    constructor(isMinHeap = true) {
        this.heap = [];
        this.isMinHeap = isMinHeap;
        this.history = [];  // History stack for Undo
        this.redoStack = []; // Redo stack
    }

    // Compare method for Min-Heap or Max-Heap
    compare(a, b) {
        return this.isMinHeap ? a < b : a > b;
    }

    // Insert a new node into the heap and re-balance
    insert(value) {
        this.history.push([...this.heap]); // Save current state for Undo
        this.redoStack = []; // Clear the redo stack on new action
        this.heap.push(value);
        this._heapifyUp(this.heap.length - 1);
        this._renderHeap();
        this._updateUndoRedoButtons();
    }

    // Insert an array of values into the heap
    insertArray(values) {
        this.history.push([...this.heap]); // Save current state for Undo
        this.redoStack = []; // Clear the redo stack on new action
        for (const value of values) {
            this.heap.push(value);
            this._heapifyUp(this.heap.length - 1);
        }
        this._renderHeap();
        this._updateUndoRedoButtons();
    }

    // Move the new node upwards to maintain heap property
    _heapifyUp(index) {
        let parentIndex = Math.floor((index - 1) / 2);
        while (index > 0 && this.compare(this.heap[index], this.heap[parentIndex])) {
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
            parentIndex = Math.floor((index - 1) / 2);
        }
    }

    // Move node downwards to maintain heap property after removal or toggling
    _heapifyDown(index) {
        let leftChild = 2 * index + 1;
        let rightChild = 2 * index + 2;
        let swapIndex = index;

        if (leftChild < this.heap.length && this.compare(this.heap[leftChild], this.heap[swapIndex])) {
            swapIndex = leftChild;
        }

        if (rightChild < this.heap.length && this.compare(this.heap[rightChild], this.heap[swapIndex])) {
            swapIndex = rightChild;
        }

        if (swapIndex !== index) {
            [this.heap[index], this.heap[swapIndex]] = [this.heap[swapIndex], this.heap[index]];
            this._heapifyDown(swapIndex);
        }
    }

    // Draw the heap structure on the canvas
    _renderHeap() {
        const canvas = document.getElementById('visualCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.heap.length === 0) return;

        const drawNode = (value, x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x, y + 5);
            ctx.stroke();
        };

        const drawLine = (x1, y1, x2, y2) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#000';  // Line color
            ctx.lineWidth = 1;  // Line stroke width (thicker for better visibility)
            ctx.stroke();
        };

        const drawTree = (index, x, y, level) => {
            if (index >= this.heap.length) return;

            const dx = 150 / (level + 1);  // Horizontal distance
            const dy = 60;  // Vertical distance

            if (2 * index + 1 < this.heap.length) {
                drawLine(x, y + 20, x - dx, y + dy - 20);
                drawTree(2 * index + 1, x - dx, y + dy, level + 1);
            }

            if (2 * index + 2 < this.heap.length) {
                drawLine(x, y + 20, x + dx, y + dy - 20);
                drawTree(2 * index + 2, x + dx, y + dy, level + 1);
            }

            drawNode(this.heap[index], x, y);
        };

        drawTree(0, canvas.width / 2, 50, 0);
    }

    // Toggle between Min-Heap and Max-Heap types
    toggleHeapType() {
        this.history.push([...this.heap]); // Save current state for Undo
        this.redoStack = []; // Clear redo stack on new action
        this.isMinHeap = !this.isMinHeap;

        for (let i = Math.floor(this.heap.length / 2); i >= 0; i--) {
            this._heapifyDown(i);
        }
        this._renderHeap();
        this._updateUndoRedoButtons();
    }

    // Undo the last action
    undo() {
        if (this.history.length > 0) {
            this.redoStack.push(this.heap); // Save current state to redo stack
            this.heap = this.history.pop(); // Restore previous state
            this._renderHeap();
            this._updateUndoRedoButtons();
        }
    }

    // Redo the last undone action
    redo() {
        if (this.redoStack.length > 0) {
            this.history.push(this.heap); // Save current state to history stack
            this.heap = this.redoStack.pop(); // Restore state from redo stack
            this._renderHeap();
            this._updateUndoRedoButtons();
        }
    }

    // Update the state of Undo/Redo buttons
    _updateUndoRedoButtons() {
        document.getElementById('undoAction').disabled = this.history.length === 0;
        document.getElementById('redoAction').disabled = this.redoStack.length === 0;
    }
}

// Initialize the visualizer as Min-Heap by default
const heapVisualizer = new HeapVisualizer();

// Event listener to add a single node to the heap
document.getElementById('addNode').addEventListener('click', () => {
    const value = parseInt(document.getElementById('nodeInput').value);
    if (!isNaN(value)) {
        heapVisualizer.insert(value);
        document.getElementById('nodeInput').value = '';
    }
});

// Event listener to add an array of nodes to the heap
document.getElementById('addArray').addEventListener('click', () => {
    const arrayInput = document.getElementById('arrayInput').value;
    const values = arrayInput.split(',').map(val => val.trim()).filter(val => val !== '');
    const validValues = [];

    let invalidInput = false;
    for (const value of values) {
        const num = parseInt(value);
        if (!isNaN(num)) {
            validValues.push(num);
        } else {
            invalidInput = true; // Set flag for invalid input
            break;
        }
    }

    if (invalidInput) {
        alert('Please enter a valid array of integers, separated by commas.');
    } else {
        heapVisualizer.insertArray(validValues);
        document.getElementById('arrayInput').value = '';
    }
});

// Event listener to toggle between Min-Heap and Max-Heap
document.getElementById('toggleHeapType').addEventListener('click', () => {
    heapVisualizer.toggleHeapType();
    const toggleButton = document.getElementById('toggleHeapType');
    toggleButton.textContent = heapVisualizer.isMinHeap ? 'Switch to Max-Heap' : 'Switch to Min-Heap';
});

// Event listener for Undo action
document.getElementById('undoAction').addEventListener('click', () => {
    heapVisualizer.undo();
});

// Event listener for Redo action
document.getElementById('redoAction').addEventListener('click', () => {
    heapVisualizer.redo();
});