/**
 * Dark Mode Theme System
 * Provides comprehensive theme management with Alpine.js integration
 */

import defineReactiveMagicProperty from '../alpine/utils.js';

document.addEventListener('alpine:init', () => {
    defineReactiveMagicProperty('theme', {
        currentTheme: null,
        storedTheme: null,

        init() {
            // Check localStorage for stored theme preference
            this.storedTheme = localStorage.getItem('theme') ?? 'system';

            // Resolve the configured theme to be only [light, dark]
            this.currentTheme = computeTheme(this.storedTheme);

            // Apply initial theme to DOM
            applyTheme(this.currentTheme);

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (event) => {
                if (this.storedTheme === 'system') {
                    this.currentTheme = event.matches ? 'dark' : 'light';
                    applyTheme(this.currentTheme);
                }
            });

            // https://livewire.laravel.com/docs/navigate#javascript-hooks - "livewire:navigated"
            document.addEventListener('livewire:navigated', () => {
                applyTheme(this.currentTheme);
            });
        },

        /**
         * Set theme preference and persist to localStorage
         */
        setTheme(newTheme) {
            this.storedTheme = newTheme;
            if (newTheme === 'system') {
                localStorage.removeItem('theme');
            } else {
                localStorage.setItem('theme', newTheme);
            }

            this.currentTheme = computeTheme(newTheme);
            applyTheme(this.currentTheme);
        },

        /**
         * Theme setter methods
         */
        setLight() {
            this.setTheme('light');
        },

        setDark() {
            this.setTheme('dark');
        },

        setSystem() {
            this.setTheme('system');
        },

        /**
         * Toggle between light and dark themes
         */
        toggle() {
            // Cycle: system -> light -> dark -> system using switch
            switch (this.storedTheme) {
                case 'system':
                    this.setTheme('light');
                    break;
                case 'light':
                    this.setTheme('dark');
                    break;
                case 'dark':
                    this.setTheme('system');
                    break;
                default:
                    this.setTheme('system');
            }
        },

        /**
         * Get current theme state information
         */
        get() {
            return {
                stored: this.storedTheme,
                current: this.currentTheme,
                isLight: this.isLight,
                isDark: this.isDark,
                isSystem: this.isSystem,
            };
        },

        // Getter methods for easy template usage
        get isLight() {
            return this.storedTheme === 'light';
        },

        get isDark() {
            return this.storedTheme === 'dark';
        },

        get isSystem() {
            return this.storedTheme === 'system';
        },

        /**
         * Sometimes we need to show only light or dark, not system mode.
         * These getters handle scenarios where we need the resolved theme state.
         */
        get isResolvedToLight() {
            if (this.isSystem) {
                return getSystemTheme() === 'light';
            }
            return this.isLight;
        },

        get isResolvedToDark() {
            if (this.isSystem) {
                return getSystemTheme() === 'dark';
            }
            return this.isDark;
        },
    });
});

/**
 * Static helper functions
 */

function computeTheme(themePreference) {
    if (themePreference === 'system') {
        return getSystemTheme();
    }
    return themePreference;
}

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    const documentElement = document.documentElement;

    if (theme === 'dark') {
        documentElement.classList.add('dark');
    } else {
        documentElement.classList.remove('dark');
    }

    // Dispatch custom event for theme change listeners
    document.dispatchEvent(
        new CustomEvent('theme-changed', {
            detail: { theme },
        }),
    );
}
