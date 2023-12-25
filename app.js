// Inisialisasi array untuk menyimpan daftar tugas (todos)
const todos = [];

// Konstanta untuk menentukan nama event untuk merender tugas
const RENDER_EVENT = 'render-todo';

// Event listener untuk menjalankan kode setelah DOM telah dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Mendapatkan referensi ke formulir submit
  const submitForm = document.getElementById('form');

  // Menambahkan event listener untuk menangani pengiriman formulir
  submitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Memanggil fungsi addTodo saat formulir dikirim
    addTodo();
  });

  // Memeriksa apakah storage (localStorage) tersedia sebelum memuat data
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Fungsi untuk membuat elemen tugas (todo) berdasarkan objek todo
const makeTodo = (todoObject) => {
  // membuat tag h2 dengan javascript
  const textTitle = document.createElement('h2');
  textTitle.innerText = todoObject.task;

  const textTimesTamp = document.createElement('p');
  textTimesTamp.innerText = todoObject.timesTamp;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textTimesTamp);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `todo-${todoObject.id}`);

  if (todoObject.isComplated) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', () => {
      undoTaskFromComplated(todoObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', () => {
      removeTaskFromComplated(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const chekButton = document.createElement('button');
    const chekButton2 = document.createElement('button');
    chekButton.classList.add('check-button');
    chekButton2.classList.add('trash-button');

    chekButton.addEventListener('click', () => {
      addTaskToComplate(todoObject.id);
    });
    chekButton2.addEventListener('click', () => {
      removeTaskFromComplated(todoObject.id);
    });
    container.append(chekButton, chekButton2);
  }
  // ... (membuat elemen-elemen HTML untuk menampilkan tugas)
  return container;
};

// Fungsi untuk menambahkan tugas ke daftar selesai (completed)
function addTaskToComplate(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget === null) return;

  todoTarget.isComplated = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk mencari objek tugas berdasarkan ID
function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

// Fungsi untuk menghapus tugas dari daftar selesai (completed) dan tidak (completed)
function removeTaskFromComplated(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk mencari indeks tugas berdasarkan ID
function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

// Fungsi untuk membatalkan tugas dari daftar selesai (completed)
function undoTaskFromComplated(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isComplated = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
// Fungsi untuk menambahkan tugas baru
const addTodo = () => {
  // Mendapatkan nilai input teks dari elemen dengan id 'title'
  const textTodo = document.getElementById('title').value;

  // Mendapatkan nilai input tanggal dari elemen dengan id 'date'
  const timesTamp = document.getElementById('date').value;

  // Menghasilkan ID unik menggunakan fungsi generateId
  const generateID = generateId();

  // Pengecekan apakah text dan tanggal sudah ada dalam todos sebelumnya
  const isDuplicate = todos.some((todo) => todo.task === textTodo && todo.timesTamp === timesTamp);

  // Jika ada tugas dengan text dan tanggal yang sama, tampilkan alert dan hentikan eksekusi
  if (isDuplicate) {
    alert('Text dan tanggal sudah digunakan oleh todo sebelumnya. Harap diganti.');
    document.getElementById('title').value = '';
    document.getElementById('date').value = '';
    return;
  }

  // Membuat objek tugas baru menggunakan fungsi generateTodoObject
  const todoObejct = generateTodoObject(generateID, textTodo, timesTamp, false);

  // Menambahkan objek tugas ke dalam array todos
  todos.push(todoObejct);

  // Memancarkan event untuk merender ulang tugas
  document.dispatchEvent(new Event(RENDER_EVENT));

  document.getElementById('title').value = '';
  document.getElementById('date').value = '';

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// Fungsi untuk menghasilkan ID unik berdasarkan waktu saat ini
function generateId() {
  return +new Date();
}

// Fungsi untuk menghasilkan objek tugas dengan properti yang sesuai
function generateTodoObject(id, task, timesTamp, isComplated) {
  return {
    id,
    task,
    timesTamp,
    isComplated,
  };
}

// Event listener untuk merender tugas saat ada perubahan dalam array todos
document.addEventListener(RENDER_EVENT, () => {
  // Menampilkan array todos di konsol untuk keperluan debug
  const uncomletedTODOList = document.getElementById('todos');
  uncomletedTODOList.innerHTML = '';

  const complateTODOList = document.getElementById('completed-todos');
  complateTODOList.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);

    if (!todoItem.isComplated) uncomletedTODOList.append(todoElement);
    else complateTODOList.append(todoElement);
  }
});

// Konstanta dan fungsi untuk menangani penyimpanan data ke localStorage
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

//  Fungsi untuk memeriksa apakah localStorage tersedia di browser(boelan)
const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
};

// Event listener untuk menampilkan data yang tersimpan di localStorage
document.addEventListener(SAVED_EVENT, () => {
  const message = 'Data Todo berhasil ditambahkan';

  // tampilakn toast menggunkan toastify
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
    backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
  }).showToast();

  console.log(localStorage.getItem(STORAGE_KEY));
});

// Fungsi untuk memuat data dari localStorage saat aplikasi dimuat
const loadDataFromStorage = () => {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};
