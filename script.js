let array = [];

const container = document.getElementById("barContainer");
const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");

// Helper: convert slider value into delay (ms)
function getDelay() {
  const min = Number(speedSlider.min);
  const max = Number(speedSlider.max);
  const val = Number(speedSlider.value);
  return max - (val - min); // Higher slider value = smaller delay
}

// Sound setup
const ctx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = "sine";
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
  osc.stop(ctx.currentTime + 0.1);
}

function generateArray() {
  array = [];
  let size = sizeSlider.value;
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 300) + 10);
  }
  showArray();
}

// correctIndices: array of indices which are in the correct place (to be colored green)
function showArray(highlightIndex1 = -1, highlightIndex2 = -1, correctIndices = []) {
  container.innerHTML = "";
  for (let i = 0; i < array.length; i++) {
    let bar = document.createElement("div");
    bar.style.height = array[i] + "px";
    bar.classList.add("bar");
    if (correctIndices.includes(i)) {
      bar.style.background = "green";
    } else if (i === highlightIndex1 || i === highlightIndex2) {
      bar.style.background = "red";
    }
    container.appendChild(bar);
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function bubbleSort() {
  let correct = [];
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      showArray(j, j+1, correct);
      playSound(array[j]*2);
      await sleep(getDelay());
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
    correct.unshift(array.length - 1 - i); // Last i elements are sorted
  }
  // All elements are now sorted
  showArray(-1, -1, Array.from(Array(array.length).keys()));
}

async function insertionSort() {
  let correct = [];
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      showArray(j, j+1, correct);
      playSound(array[j]*2);
      await sleep(getDelay());
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = key;
    // Mark up to i as sorted if they are all in order
    let sorted = true;
    for (let k = 0; k <= i; k++) {
      if (array[k] > array[k+1]) { sorted = false; break; }
    }
    if (sorted) correct = Array.from({length: i+1}, (_, idx) => idx);
  }
  showArray(-1, -1, Array.from(Array(array.length).keys()));
}

async function selectionSort() {
  let correct = [];
  for (let i = 0; i < array.length; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      showArray(minIndex, j, correct);
      playSound(array[j]*2);
      await sleep(getDelay());
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    [array[i], array[minIndex]] = [array[minIndex], array[i]];
    correct.push(i); // i is now sorted
  }
  showArray(-1, -1, Array.from(Array(array.length).keys()));
}

async function shellSort() {
  let n = array.length;
  let correct = [];
  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
    for (let i = gap; i < n; i++) {
      let temp = array[i];
      let j;
      for (j = i; j >= gap && array[j-gap] > temp; j -= gap) {
        showArray(j, j-gap, correct);
        playSound(array[j]*2);
        await sleep(getDelay());
        array[j] = array[j-gap];
      }
      array[j] = temp;
    }
  }
  showArray(-1, -1, Array.from(Array(array.length).keys()));
}

async function mergeSortStart() {
  await mergeSort(0, array.length - 1);
  showArray(-1, -1, Array.from(Array(array.length).keys()));
}

async function mergeSort(left, right) {
  if (left >= right) return;
  let mid = Math.floor((left + right) / 2);
  await mergeSort(left, mid);
  await mergeSort(mid + 1, right);
  await merge(left, mid, right);
}

async function merge(left, mid, right) {
  let n1 = mid - left + 1;
  let n2 = right - mid;

  let L = array.slice(left, mid + 1);
  let R = array.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < n1 && j < n2) {
    showArray(k, k+1);
    playSound(array[k]*2);
    await sleep(getDelay());
    if (L[i] <= R[j]) {
      array[k] = L[i];
      i++;
    } else {
      array[k] = R[j];
      j++;
    }
    k++;
  }
  while (i < n1) array[k++] = L[i++];
  while (j < n2) array[k++] = R[j++];
}

// Initialize first array
generateArray();
