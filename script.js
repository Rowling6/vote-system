// 全局变量
let votes = JSON.parse(localStorage.getItem('votes')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// 作品数据
const works = [
    { id: 1, name: '作品名称 1', author: '张三' },
    { id: 2, name: '作品名称 2', author: '李四' },
    { id: 3, name: '作品名称 3', author: '王五' }
];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化评分显示
    const scoreInput = document.getElementById('score');
    if (scoreInput) {
        scoreInput.addEventListener('input', updateScoreDisplay);
    }
    
    // 检查是否在后台页面
    if (window.location.pathname.includes('admin.html')) {
        if (isLoggedIn) {
            showAdminPanel();
        }
    }
});

// 更新评分显示
function updateScoreDisplay() {
    const scoreInput = document.getElementById('score');
    const scoreValue = document.getElementById('score-value');
    if (scoreInput && scoreValue) {
        let value = parseInt(scoreInput.value);
        if (isNaN(value) || value < 0) {
            value = 0;
        } else if (value > 100) {
            value = 100;
        }
        scoreValue.textContent = value;
        scoreInput.value = value;
    }
}

// 打开投票表单
function openVoteForm(workId) {
    const modal = document.getElementById('vote-modal');
    const workIdInput = document.getElementById('work-id');
    if (modal && workIdInput) {
        workIdInput.value = workId;
        modal.style.display = 'block';
    }
}

// 关闭投票表单
function closeVoteForm() {
    const modal = document.getElementById('vote-modal');
    const form = document.getElementById('vote-form');
    const message = document.getElementById('vote-message');
    if (modal) {
        modal.style.display = 'none';
    }
    if (form) {
        form.reset();
    }
    if (message) {
        message.textContent = '';
        message.className = 'message';
    }
    // 重置评分显示
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
        scoreValue.textContent = '50';
    }
}

// 提交投票
function submitVote() {
    const form = document.getElementById('vote-form');
    const message = document.getElementById('vote-message');
    
    if (!form.checkValidity()) {
        // 表单验证失败
        form.reportValidity();
        return false;
    }
    
    // 获取表单数据
    const formData = new FormData(form);
    const vote = {
        id: Date.now(),
        workId: parseInt(formData.get('work-id')),
        voterName: formData.get('voter-name'),
        score: parseInt(formData.get('score')),
        comment: formData.get('comment'),
        date: new Date().toISOString()
    };
    
    // 保存到localStorage
    votes.push(vote);
    localStorage.setItem('votes', JSON.stringify(votes));
    
    // 显示成功消息
    if (message) {
        message.textContent = '投票提交成功！';
        message.className = 'message success';
    }
    
    // 3秒后关闭表单
    setTimeout(() => {
        closeVoteForm();
    }, 3000);
    
    return false;
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('login-message');
    
    // 简单的身份验证
    if (username === 'admin' && password === '123456') {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        showAdminPanel();
        return false;
    } else {
        if (message) {
            message.textContent = '用户名或密码错误！';
            message.className = 'message error';
        }
        return false;
    }
}

// 退出登录
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
}

// 显示后台管理面板
function showAdminPanel() {
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (loginSection) {
        loginSection.style.display = 'none';
    }
    if (adminPanel) {
        adminPanel.style.display = 'block';
    }
    if (welcomeMessage) {
        welcomeMessage.textContent = '欢迎回来，管理员！';
    }
    
    // 更新统计数据
    updateStats();
    
    // 显示评价数据
    renderVotes();
}

// 更新统计数据
function updateStats() {
    const totalVotes = document.getElementById('total-votes');
    const averageScore = document.getElementById('average-score');
    const maxScore = document.getElementById('max-score');
    const minScore = document.getElementById('min-score');
    
    if (totalVotes) {
        totalVotes.textContent = votes.length;
    }
    
    if (votes.length > 0) {
        const scores = votes.map(v => v.score);
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        if (averageScore) {
            averageScore.textContent = avg.toFixed(2);
        }
        if (maxScore) {
            maxScore.textContent = Math.max(...scores);
        }
        if (minScore) {
            minScore.textContent = Math.min(...scores);
        }
    } else {
        if (averageScore) {
            averageScore.textContent = '0';
        }
        if (maxScore) {
            maxScore.textContent = '0';
        }
        if (minScore) {
            minScore.textContent = '0';
        }
    }
}

// 渲染评价数据
function renderVotes(filteredVotes = null) {
    const container = document.getElementById('votes-container');
    if (!container) return;
    
    const votesToRender = filteredVotes || votes;
    
    if (votesToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>暂无评价数据</h4>
                <p>当有用户提交投票后，评价数据将显示在这里</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = votesToRender.map(vote => {
        const work = works.find(w => w.id === vote.workId);
        const date = new Date(vote.date).toLocaleString('zh-CN');
        
        return `
            <div class="vote-item">
                <div class="vote-header">
                    <div class="vote-meta">
                        <span class="vote-work">作品：${work ? work.name : '未知作品'}</span>
                        <span class="vote-voter">投票人：${vote.voterName}</span>
                        <span class="vote-score">评分：${vote.score}分</span>
                    </div>
                    <div class="vote-date">${date}</div>
                </div>
                <div class="vote-content">
                    <p>${vote.comment || '无评价内容'}</p>
                </div>
            </div>
        `;
    }).join('');
}

// 更新分数范围显示
function updateScoreRange() {
    const scoreRange = document.getElementById('score-range');
    const scoreRangeValue = document.getElementById('score-range-value');
    if (scoreRange && scoreRangeValue) {
        scoreRangeValue.textContent = `0-${scoreRange.value}`;
        filterAndSortVotes();
    }
}

// 筛选和排序评价数据
function filterAndSortVotes() {
    const workFilter = document.getElementById('work-filter');
    const sortBy = document.getElementById('sort-by');
    const scoreRange = document.getElementById('score-range');
    
    if (!workFilter || !sortBy || !scoreRange) return;
    
    let filtered = [...votes];
    
    // 作品筛选
    const workId = workFilter.value;
    if (workId !== 'all') {
        filtered = filtered.filter(v => v.workId === parseInt(workId));
    }
    
    // 分数范围筛选
    const maxScore = parseInt(scoreRange.value);
    filtered = filtered.filter(v => v.score <= maxScore);
    
    // 排序
    const sortOption = sortBy.value;
    switch (sortOption) {
        case 'date-desc':
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'score-desc':
            filtered.sort((a, b) => b.score - a.score);
            break;
        case 'score-asc':
            filtered.sort((a, b) => a.score - b.score);
            break;
    }
    
    // 重新渲染
    renderVotes(filtered);
}

// 点击模态框外部关闭表单
window.onclick = function(event) {
    const modal = document.getElementById('vote-modal');
    if (event.target === modal) {
        closeVoteForm();
    }
}

// 键盘事件监听
document.addEventListener('keydown', function(event) {
    // ESC键关闭模态框
    if (event.key === 'Escape') {
        closeVoteForm();
    }
    
    // 回车键提交表单（如果在登录页面）
    if (event.key === 'Enter' && window.location.pathname.includes('admin.html') && !isLoggedIn) {
        const loginForm = document.getElementById('login-form');
        if (loginForm && document.activeElement.form === loginForm) {
            login();
        }
    }
});

// 表单验证增强
function validateForm() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
}

// 添加表单验证增强
validateForm();

// 导出数据功能（后台）
function exportData() {
    const dataStr = JSON.stringify(votes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `votes_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 清空数据功能（后台）
function clearData() {
    if (confirm('确定要清空所有评价数据吗？此操作不可恢复！')) {
        votes = [];
        localStorage.removeItem('votes');
        updateStats();
        renderVotes();
    }
}

// 添加导出和清空数据按钮到后台面板
function addAdminActions() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        const statsSection = adminPanel.querySelector('.stats-section');
        if (statsSection) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'admin-actions';
            actionsDiv.innerHTML = `
                <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                    <button onclick="exportData()" class="submit-btn" style="background-color: #3498db;">导出数据</button>
                    <button onclick="clearData()" class="cancel-btn">清空数据</button>
                </div>
            `;
            statsSection.appendChild(actionsDiv);
        }
    }
}

// 如果在后台页面且已登录，添加管理员操作按钮
if (window.location.pathname.includes('admin.html')) {
    if (isLoggedIn) {
        addAdminActions();
    }
}