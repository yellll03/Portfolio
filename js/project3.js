let timer;
let secondsLeft = 1500;

function setFocusTime() {
  const selected = document.getElementById('focus-time').value;
  secondsLeft = parseInt(selected);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  display.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  document.getElementById('timer-display').classList.add('animate');
  if (!timer) {
    timer = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timer);
        timer = null;
        alert("Time's up! Great job.");
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
  document.getElementById('timer-display').classList.remove('animate');
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  setFocusTime();
  document.getElementById('timer-display').classList.remove('animate');
}

// YOUTUBE SOUND EMBED
function changeSound() {
  const player = document.getElementById('yt-player');
  const theme = document.getElementById('sound-theme').value;
  let url = "";

  switch (theme) {
    case 'lofi':
      url = "https://www.youtube.com/embed/DEWzT1geuPU?autoplay=1&loop=1";
      break;
    case 'cafe':
      url = "https://www.youtube.com/embed/IUfA_J4eES0?autoplay=1&loop=1";
      break;
    case 'window':
      url = "https://www.youtube.com/embed/jgcpdCQ5rJM?autoplay=1&loop=1";
      break;
  }

  player.src = url;
}


// TASK SYSTEM
function addTask() {
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const task = taskInput.value.trim();

  if (task === '') {
    alert("Please enter a task.");
    return;
  }

  const li = document.createElement('li');

  const textDiv = document.createElement('div');
  textDiv.className = 'task-text';

  const taskSpan = document.createElement('span');
  taskSpan.textContent = task;

  textDiv.appendChild(taskSpan);

  const btnDiv = document.createElement('div');
  btnDiv.className = 'task-buttons';

  const doneBtn = document.createElement('button');
  doneBtn.textContent = 'Done';
  doneBtn.title = 'Finish';
  doneBtn.onclick = () => {
    li.classList.toggle('completed');
  };

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.title = 'Edit';
  editBtn.onclick = () => {
    const newText = prompt('Edit your task:', taskSpan.textContent);
    if (newText) taskSpan.textContent = newText;
  };

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.title = 'Delete';
  delBtn.onclick = () => taskList.removeChild(li);

  btnDiv.appendChild(doneBtn);
  btnDiv.appendChild(editBtn);
  btnDiv.appendChild(delBtn);

  li.appendChild(textDiv);
  li.appendChild(btnDiv);

  taskList.appendChild(li);
  taskInput.value = '';
}
