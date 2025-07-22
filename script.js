// Состояние приложения
let state = {
    currentUser: null,
    users: [
        { id: 1, name: 'admin', email: 'admin@example.com', password: 'admin123' },
        { id: 2, name: 'user1', email: 'user1@example.com', password: 'user1123' },
    ],
    posts: [
        {
            id: 1,
            authorId: 1,
            title: 'Мой первый пост',
            content: 'Это содержимое моего первого поста.',
            date: '2023-05-15',
            tags: ['новости', 'блог'],
            isPrivate: false,
            comments: [{ id: 1, authorId: 2, content: 'Отличный пост!', date: '2023-05-16' }],
        },
        {
            id: 2,
            authorId: 2,
            title: 'Секретный пост',
            content: 'Этот пост видят только мои подписчики.',
            date: '2023-05-16',
            tags: ['личное'],
            isPrivate: true,
            comments: [],
        },
    ],
    subscriptions: {
        1: [2], // admin подписан на user1
        2: [], // user1 ни на кого не подписан
    },
    isLoginMode: true,
};

// DOM элементы
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const newPostBtn = document.getElementById('new-post-btn');
const authModal = document.getElementById('auth-modal');
const postModal = document.getElementById('post-modal');
const authForm = document.getElementById('auth-form');
const postForm = document.getElementById('post-form');
const authSwitch = document.getElementById('auth-switch');
const modalTitle = document.getElementById('modal-title');
const nameField = document.getElementById('name-field');
const usernameDisplay = document.getElementById('username-display');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const postsContainer = document.getElementById('posts-container');
const subscriptionsList = document.getElementById('subscriptions-list');
const subscribeSection = document.getElementById('subscribe-section');
const subscribeTo = document.getElementById('subscribe-to');
const subscribeBtn = document.getElementById('subscribe-btn');
const tagsCloud = document.getElementById('tags-cloud');

// Закрытие модальных окон
document.querySelectorAll('.close').forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
        postModal.classList.add('hidden');
    });
});

// Открытие модального окна входа
loginBtn.addEventListener('click', () => {
    state.isLoginMode = true;
    modalTitle.textContent = 'Вход';
    authSwitch.textContent = 'Нужно зарегистрироваться?';
    nameField.classList.add('hidden');
    authModal.classList.remove('hidden');
});

// Открытие модального окна регистрации
registerBtn.addEventListener('click', () => {
    state.isLoginMode = false;
    modalTitle.textContent = 'Регистрация';
    authSwitch.textContent = 'Уже есть аккаунт? Войти';
    nameField.classList.remove('hidden');
    authModal.classList.remove('hidden');
});

// Переключение между входом и регистрацией
authSwitch.addEventListener('click', () => {
    state.isLoginMode = !state.isLoginMode;
    if (state.isLoginMode) {
        modalTitle.textContent = 'Вход';
        authSwitch.textContent = 'Нужно зарегистрироваться?';
        nameField.classList.add('hidden');
    } else {
        modalTitle.textContent = 'Регистрация';
        authSwitch.textContent = 'Уже есть аккаунт? Войти';
        nameField.classList.remove('hidden');
    }
});

// Обработка формы авторизации/регистрации
authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (state.isLoginMode) {
        // Вход
        const user = state.users.find((u) => u.email === email && u.password === password);
        if (user) {
            state.currentUser = user;
            updateUI();
            authModal.classList.add('hidden');
            authForm.reset();
        } else {
            alert('Неверный email или пароль');
        }
    } else {
        // Регистрация
        const name = document.getElementById('name').value;
        if (state.users.some((u) => u.email === email)) {
            alert('Пользователь с таким email уже существует');
            return;
        }

        const newUser = {
            id: state.users.length + 1,
            name,
            email,
            password,
        };

        state.users.push(newUser);
        state.subscriptions[newUser.id] = [];
        state.currentUser = newUser;
        updateUI();
        authModal.classList.add('hidden');
        authForm.reset();
    }
});

// Выход из системы
logoutBtn.addEventListener('click', () => {
    state.currentUser = null;
    updateUI();
});

// Открытие модального окна нового поста
newPostBtn.addEventListener('click', () => {
    postModal.classList.remove('hidden');
});

// Обработка формы нового поста
postForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const tags = document
        .getElementById('post-tags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    const isPrivate = document.getElementById('post-private').checked;

    const newPost = {
        id: state.posts.length + 1,
        authorId: state.currentUser.id,
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        tags,
        isPrivate,
        comments: [],
    };

    state.posts.unshift(newPost); // Добавляем в начало массива
    renderPosts();
    postModal.classList.add('hidden');
    postForm.reset();
});

// Подписка на пользователя
subscribeBtn.addEventListener('click', () => {
    const username = subscribeTo.value.trim();
    if (!username) return;

    const userToSubscribe = state.users.find((u) => u.name === username);
    if (!userToSubscribe) {
        alert('Пользователь не найден');
        return;
    }

    if (userToSubscribe.id === state.currentUser.id) {
        alert('Нельзя подписаться на себя');
        return;
    }

    if (state.subscriptions[state.currentUser.id].includes(userToSubscribe.id)) {
        alert('Вы уже подписаны на этого пользователя');
        return;
    }

    state.subscriptions[state.currentUser.id].push(userToSubscribe.id);
    renderSubscriptions();
    subscribeTo.value = '';
});

// Обновление интерфейса
function updateUI() {
    if (state.currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        usernameDisplay.textContent = state.currentUser.name;
        subscribeSection.classList.remove('hidden');
        newPostBtn.classList.remove('hidden');
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
        subscribeSection.classList.add('hidden');
        newPostBtn.classList.add('hidden');
    }

    renderPosts();
    renderSubscriptions();
    renderTagsCloud();
}

// Отображение постов
function renderPosts() {
    postsContainer.innerHTML = '';

    let postsToShow = [...state.posts];

    // Если пользователь не авторизован, показываем только публичные посты
    if (!state.currentUser) {
        postsToShow = postsToShow.filter((post) => !post.isPrivate);
    }
    // Если авторизован, показываем публичные и приватные от тех, на кого подписан
    else {
        postsToShow = postsToShow.filter((post) => !post.isPrivate || post.authorId === state.currentUser.id || state.subscriptions[state.currentUser.id].includes(post.authorId));
    }

    if (postsToShow.length === 0) {
        postsContainer.innerHTML = '<p>Нет постов для отображения</p>';
        return;
    }

    postsToShow.forEach((post) => {
        const author = state.users.find((u) => u.id === post.authorId);
        const postElement = document.createElement('div');
        postElement.className = 'post';

        // Проверяем, может ли текущий пользователь редактировать пост
        const canEdit = state.currentUser && state.currentUser.id === post.authorId;

        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <div class="post-meta">
                Автор: ${author.name} | Дата: ${post.date}
            </div>
            <p>${post.content}</p>
            <div class="post-tags">
                ${post.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
                ${post.isPrivate ? '<span class="tag private-tag">только для подписчиков</span>' : ''}
            </div>
            ${
                canEdit
                    ? `
            <div class="post-actions">
                <button class="edit-post" data-id="${post.id}">Редактировать</button>
                <button class="delete-post" data-id="${post.id}">Удалить</button>
            </div>
            `
                    : ''
            }
            <div class="comments">
                <h4>Комментарии (${post.comments.length})</h4>
                ${post.comments
                    .map((comment) => {
                        const commentAuthor = state.users.find((u) => u.id === comment.authorId);
                        return `
                    <div class="comment">
                        <strong>${commentAuthor.name}</strong>: ${comment.content}
                        <div class="comment-meta">${comment.date}</div>
                    </div>
                    `;
                    })
                    .join('')}
                ${
                    state.currentUser
                        ? `
                <form class="comment-form" data-post-id="${post.id}">
                    <textarea placeholder="Ваш комментарий" required></textarea>
                    <button type="submit">Отправить</button>
                </form>
                `
                        : '<p>Войдите, чтобы оставить комментарий</p>'
                }
            </div>
        `;

        postsContainer.appendChild(postElement);
    });

    // Добавляем обработчики для кнопок редактирования и удаления
    document.querySelectorAll('.edit-post').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const postId = parseInt(e.target.getAttribute('data-id'));
            editPost(postId);
        });
    });

    document.querySelectorAll('.delete-post').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const postId = parseInt(e.target.getAttribute('data-id'));
            deletePost(postId);
        });
    });

    // Добавляем обработчики для форм комментариев
    document.querySelectorAll('.comment-form').forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const postId = parseInt(form.getAttribute('data-post-id'));
            const content = form.querySelector('textarea').value;
            addComment(postId, content);
            form.querySelector('textarea').value = '';
        });
    });
}

// Редактирование поста
function editPost(postId) {
    const post = state.posts.find((p) => p.id === postId);
    if (!post) return;

    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-tags').value = post.tags.join(', ');
    document.getElementById('post-private').checked = post.isPrivate;

    postModal.classList.remove('hidden');

    // Удаляем старый обработчик и добавляем новый для редактирования
    postForm.removeEventListener('submit', handleEditSubmit);

    function handleEditSubmit(e) {
        e.preventDefault();

        post.title = document.getElementById('post-title').value;
        post.content = document.getElementById('post-content').value;
        post.tags = document
            .getElementById('post-tags')
            .value.split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        post.isPrivate = document.getElementById('post-private').checked;

        renderPosts();
        postModal.classList.add('hidden');
        postForm.reset();

        // Удаляем временный обработчик
        postForm.removeEventListener('submit', handleEditSubmit);
        // Возвращаем стандартный обработчик для новых постов
        postForm.addEventListener('submit', postFormSubmitHandler);
    }

    const postFormSubmitHandler = (e) => {
        postForm.removeEventListener('submit', postFormSubmitHandler);
        postForm.addEventListener('submit', handleEditSubmit);
        handleEditSubmit(e);
    };

    postForm.addEventListener('submit', postFormSubmitHandler);
}

// Удаление поста
function deletePost(postId) {
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        state.posts = state.posts.filter((p) => p.id !== postId);
        renderPosts();
    }
}

// Добавление комментария
function addComment(postId, content) {
    const post = state.posts.find((p) => p.id === postId);
    if (!post) return;

    const newComment = {
        id: post.comments.length + 1,
        authorId: state.currentUser.id,
        content,
        date: new Date().toISOString().split('T')[0],
    };

    post.comments.push(newComment);
    renderPosts();
}

// Отображение подписок
function renderSubscriptions() {
    subscriptionsList.innerHTML = '';

    if (!state.currentUser) return;

    const subscriptions = state.subscriptions[state.currentUser.id];
    if (subscriptions.length === 0) {
        subscriptionsList.innerHTML = '<li>Вы ни на кого не подписаны</li>';
        return;
    }

    subscriptions.forEach((userId) => {
        const user = state.users.find((u) => u.id === userId);
        if (user) {
            const li = document.createElement('li');
            li.textContent = user.name;
            subscriptionsList.appendChild(li);
        }
    });
}

// Отображение облака тегов
function renderTagsCloud() {
    tagsCloud.innerHTML = '';

    // Собираем все теги из постов
    const allTags = {};
    state.posts.forEach((post) => {
        post.tags.forEach((tag) => {
            if (!allTags[tag]) {
                allTags[tag] = 0;
            }
            allTags[tag]++;
        });
    });

    // Сортируем теги по популярности
    const sortedTags = Object.keys(allTags).sort((a, b) => allTags[b] - allTags[a]);

    // Создаем элементы тегов
    sortedTags.forEach((tag) => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => filterPostsByTag(tag));
        tagsCloud.appendChild(tagElement);
    });
}

// Фильтрация постов по тегу
function filterPostsByTag(tag) {
    const allPosts = [...state.posts];
    let filteredPosts = allPosts.filter((post) => post.tags.includes(tag));

    // Применяем те же правила видимости, что и в renderPosts
    if (!state.currentUser) {
        filteredPosts = filteredPosts.filter((post) => !post.isPrivate);
    } else {
        filteredPosts = filteredPosts.filter((post) => !post.isPrivate || post.authorId === state.currentUser.id || state.subscriptions[state.currentUser.id].includes(post.authorId));
    }

    // Временно заменяем postsContainer
    const tempContainer = document.createElement('div');

    if (filteredPosts.length === 0) {
        tempContainer.innerHTML = '<p>Нет постов с тегом "' + tag + '"</p>';
    } else {
        filteredPosts.forEach((post) => {
            const author = state.users.find((u) => u.id === post.authorId);
            const postElement = document.createElement('div');
            postElement.className = 'post';

            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <div class="post-meta">
                    Автор: ${author.name} | Дата: ${post.date}
                </div>
                <p>${post.content}</p>
                <div class="post-tags">
                    ${post.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
                </div>
            `;

            tempContainer.appendChild(postElement);
        });
    }

    // Добавляем кнопку "Назад"
    const backButton = document.createElement('button');
    backButton.textContent = 'Вернуться ко всем постам';
    backButton.addEventListener('click', () => {
        renderPosts();
        renderTagsCloud();
    });
    tempContainer.prepend(backButton);

    postsContainer.innerHTML = '';
    postsContainer.appendChild(tempContainer);
}

// Инициализация приложения
updateUI();
