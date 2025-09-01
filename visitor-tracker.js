// visitor-tracker.js
// Advanced GitHub Profile Visitor Tracking System

class GitHubProfileTracker {
    constructor(username) {
        this.username = username;
        this.visitorData = {
            totalViews: 0,
            uniqueVisitors: 0,
            todayViews: 0,
            thisWeekViews: 0,
            thisMonthViews: 0,
            lastVisitors: [],
            visitHistory: []
        };
        this.init();
    }

    async init() {
        await this.loadVisitorData();
        this.trackVisit();
        this.updateDisplay();
        this.startPeriodicUpdate();
    }

    async loadVisitorData() {
        try {
            // Load from localStorage or initialize
            const saved = localStorage.getItem(`github_profile_${this.username}`);
            if (saved) {
                this.visitorData = JSON.parse(saved);
            }
        } catch (error) {
            console.log('Initializing new visitor data');
        }
    }

    trackVisit() {
        const now = new Date();
        const visitorId = this.generateVisitorId();
        const visitInfo = {
            id: visitorId,
            timestamp: now.toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href
        };

        // Update visitor data
        this.visitorData.totalViews++;
        this.visitorData.lastVisitors.unshift(visitInfo);
        this.visitorData.lastVisitors = this.visitorData.lastVisitors.slice(0, 10); // Keep last 10
        this.visitorData.visitHistory.push(visitInfo);

        // Calculate unique visitors
        const uniqueVisitors = new Set(this.visitorData.visitHistory.map(v => v.id));
        this.visitorData.uniqueVisitors = uniqueVisitors.size;

        // Calculate time-based stats
        this.calculateTimeBasedStats();

        this.saveVisitorData();
    }

    generateVisitorId() {
        // Generate a semi-unique visitor ID based on browser fingerprint
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ].join('|');
        
        return btoa(fingerprint).substring(0, 16);
    }

    calculateTimeBasedStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        this.visitorData.todayViews = this.visitorData.visitHistory.filter(v => 
            new Date(v.timestamp) >= today
        ).length;

        this.visitorData.thisWeekViews = this.visitorData.visitHistory.filter(v => 
            new Date(v.timestamp) >= weekAgo
        ).length;

        this.visitorData.thisMonthViews = this.visitorData.visitHistory.filter(v => 
            new Date(v.timestamp) >= monthAgo
        ).length;
    }

    saveVisitorData() {
        try {
            localStorage.setItem(`github_profile_${this.username}`, JSON.stringify(this.visitorData));
        } catch (error) {
            console.error('Failed to save visitor data:', error);
        }
    }

    updateDisplay() {
        // Update the display with current stats
        const statsContainer = document.getElementById('visitor-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="visitor-stats">
                    <h4>📊 Real-time Visitor Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Total Views:</span>
                            <span class="stat-value">${this.visitorData.totalViews}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Unique Visitors:</span>
                            <span class="stat-value">${this.visitorData.uniqueVisitors}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Today:</span>
                            <span class="stat-value">${this.visitorData.todayViews}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">This Week:</span>
                            <span class="stat-value">${this.visitorData.thisWeekViews}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">This Month:</span>
                            <span class="stat-value">${this.visitorData.thisMonthViews}</span>
                        </div>
                    </div>
                    <div class="recent-visitors">
                        <h5>👥 Recent Visitors (Last 10)</h5>
                        <div class="visitor-list">
                            ${this.visitorData.lastVisitors.map(visitor => `
                                <div class="visitor-item">
                                    <span class="visitor-id">${visitor.id.substring(0, 8)}...</span>
                                    <span class="visit-time">${new Date(visitor.timestamp).toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    startPeriodicUpdate() {
        // Update display every 30 seconds
        setInterval(() => {
            this.updateDisplay();
        }, 30000);
    }

    getAnalytics() {
        return {
            ...this.visitorData,
            generatedAt: new Date().toISOString()
        };
    }
}

// Initialize tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new GitHubProfileTracker('gpl-gowthamchand');
    
    // Make tracker available globally for debugging
    window.githubProfileTracker = tracker;
    
    console.log('GitHub Profile Visitor Tracker initialized');
    console.log('Current analytics:', tracker.getAnalytics());
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubProfileTracker;
}
