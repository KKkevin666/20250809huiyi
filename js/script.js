/**
 * 会议纪要网页交互管理器
 */
class InteractionManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    /**
     * 初始化交互功能
     */
    init() {
        this.initTheme();
        this.initScrollAnimations();
        this.initCollapseAnimations();
        this.bindEvents();
        console.log('会议纪要网页已初始化');
    }

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * 设置主题
     * @param {string} theme - 主题名称
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    /**
     * 滚动到指定部分
     * @param {string} sectionId - 部分ID
     */
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const elementPosition = element.offsetTop - navbarHeight - 20;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * 初始化滚动动画
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // 观察所有卡片元素
        document.querySelectorAll('.card').forEach(card => {
            observer.observe(card);
        });
    }

    /**
     * 初始化折叠面板动画
     */
    initCollapseAnimations() {
        const collapses = document.querySelectorAll('.collapse');
        
        collapses.forEach(collapse => {
            const checkbox = collapse.querySelector('input[type="checkbox"]');
            const content = collapse.querySelector('.collapse-content');
            
            if (checkbox && content) {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    } else {
                        content.style.maxHeight = '0px';
                    }
                });
            }
        });
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 导航链接点击事件
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + D 切换主题
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // 滚动时更新导航状态
        window.addEventListener('scroll', this.throttle(() => {
            this.updateActiveNavigation();
        }, 100));
    }

    /**
     * 更新活跃导航状态
     */
    updateActiveNavigation() {
        const sections = ['background', 'core-content', 'cooperation', 'actions'];
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        let activeSection = '';

        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight) {
                    activeSection = sectionId;
                }
            }
        });

        // 更新导航链接状态
        document.querySelectorAll('.navbar a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                if (targetId === activeSection) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 节流时间间隔
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} fixed top-20 right-4 z-50 w-auto max-w-sm shadow-lg`;
        notification.innerHTML = `
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * 导出为PDF（打印功能）
     */
    exportToPDF() {
        window.print();
        this.showNotification('正在准备打印...', 'info');
    }
}

// 全局函数，供HTML调用
window.scrollToSection = function(sectionId) {
    if (window.interactionManager) {
        window.interactionManager.scrollToSection(sectionId);
    }
};

window.toggleTheme = function() {
    if (window.interactionManager) {
        window.interactionManager.toggleTheme();
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.interactionManager = new InteractionManager();
});

// 导出模块
export { InteractionManager };