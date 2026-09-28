/*
    Redbee.dev Settings Manager
    Loads and applies interchangeable system settings across all pages.
    Settings are stored in localStorage for easy editing via settings.html.
*/

(function () {
    'use strict';

    var STORAGE_KEY = 'redbee_settings';

    var defaultSettings = {
        /* ---- Branding ---- */
        brandName: 'Redbee.dev',
        tagline: 'Growth Systems',
        logoText: 'Redbee.dev',

        /* ---- Links ---- */
        calendlyLink: 'https://calendly.com/redbee-dev/discovery',
        whatsappLink: 'https://wa.me/8801301522070',
        emailPrimary: 'info@redbee.dev',
        emailSecondary: 'xar.redbee@gmail.com',

        /* ---- Colors ---- */
        colorBase: '#FFFFFF',
        colorInk: '#000000',
        colorSafety: '#FF3E00',
        colorMuted: '#888888',
        colorSurface: '#F5F5F0',
        colorTermBg: '#08080A',
        colorTermGreen: '#00FF66',
        colorTermAmber: '#FFAA00',

        /* ---- Hero Stats ---- */
        heroProjects: '50+',
        heroSatisfaction: '4.9★',
        heroExpertise: '12+',

        /* ---- Services ---- */
        serviceLandingPrice: '$650–$1,200',
        serviceWordPressPrice: '$900–$1,800',
        serviceEcommercePrice: '$1,500–$3,500',
        serviceAdminVaPrice: '$999/mo',
        serviceRealEstateVaPrice: '$1,199/mo',
        serviceAppointmentPrice: '$1,399/mo',

        /* ---- Launchpad ---- */
        launchpadDevCost: '$0',

        /* ---- Footer ---- */
        footerCopy: '© 2026 Redbee.dev. All rights reserved.',

        /* ---- Social ---- */
        socialLinkedIn: '#',
        socialGitHub: '#',
        socialX: '#',
        socialYouTube: '#'
    };

    function loadSettings() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                var merged = {};
                for (var key in defaultSettings) {
                    merged[key] = (parsed && parsed[key] !== undefined && parsed[key] !== '')
                        ? parsed[key]
                        : defaultSettings[key];
                }
                return merged;
            }
        } catch (e) {
            /* Ignore corrupted storage and fall back to defaults */
        }
        return Object.assign({}, defaultSettings);
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            return false;
        }
    }

    function applySettings(settings) {
        var root = document.documentElement;
        var style = document.createElement('style');
        style.id = 'settings-theme';

        style.textContent =
            ':root {' +
            '--base: ' + settings.colorBase + ';' +
            '--ink: ' + settings.colorInk + ';' +
            '--safety: ' + settings.colorSafety + ';' +
            '--muted: ' + settings.colorMuted + ';' +
            '--surface: ' + settings.colorSurface + ';' +
            '--term-bg: ' + settings.colorTermBg + ';' +
            '--term-green: ' + settings.colorTermGreen + ';' +
            '--term-amber: ' + settings.colorTermAmber + ';' +
            '}';

        var existing = document.getElementById(style.id);
        if (existing) {
            existing.textContent = style.textContent;
        } else {
            document.head.appendChild(style);
        }

        /* ---- Text content bindings ---- */
        var bindings = [
            { selector: '.js-brand-name', property: 'textContent', value: settings.brandName },
            { selector: '.header__product', property: 'textContent', value: settings.tagline },
            { selector: '.footer__brand-name', property: 'textContent', value: settings.brandName },
            { selector: '.footer__copy', property: 'textContent', value: settings.footerCopy }
        ];

        bindings.forEach(function (binding) {
            var el = document.querySelector(binding.selector);
            if (!el) return;

            if (binding.property === 'lastChild') {
                if (el.lastChild && el.lastChild.nodeType === 3) {
                    el.lastChild.nodeValue = binding.value;
                }
            } else {
                el.textContent = binding.value;
            }
        });

        /* ---- Links ---- */
        document.querySelectorAll('a[href*="calendly"], .js-calendly-link').forEach(function (el) {
            el.setAttribute('href', settings.calendlyLink);
        });

        document.querySelectorAll('.whatsapp-support').forEach(function (el) {
            el.setAttribute('href', settings.whatsappLink);
        });

        document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
            var href = el.getAttribute('href');
            if (href === 'mailto:info@redbee.dev') {
                el.setAttribute('href', 'mailto:' + settings.emailPrimary);
            } else if (href === 'mailto:xar.redbee@gmail.com') {
                el.setAttribute('href', 'mailto:' + settings.emailSecondary);
            }
        });

        /* ---- Hero stats ---- */
        var heroStats = document.querySelectorAll('.hero__stat-num');
        if (heroStats.length >= 3) {
            var values = [settings.heroProjects, settings.heroSatisfaction, settings.heroExpertise];
            heroStats.forEach(function (el, index) {
                var textNode = null;
                for (var i = 0; i < el.childNodes.length; i++) {
                    if (el.childNodes[i].nodeType === 3 && el.childNodes[i].nodeValue.trim()) {
                        textNode = el.childNodes[i];
                        break;
                    }
                }
                if (textNode && values[index]) {
                    textNode.nodeValue = values[index];
                }
            });
        }

        /* ---- Service prices ---- */
        var servicePrices = document.querySelectorAll('.bento-card__stat');
        var priceValues = [
            settings.serviceLandingPrice,
            settings.serviceWordPressPrice,
            settings.serviceEcommercePrice,
            settings.serviceAdminVaPrice,
            settings.serviceRealEstateVaPrice,
            settings.serviceAppointmentPrice
        ];
        servicePrices.forEach(function (el, index) {
            if (priceValues[index]) {
                el.textContent = priceValues[index];
            }
        });

        /* ---- Launchpad ---- */
        var launchpadCost = document.querySelector('.stack__card-step');
        if (launchpadCost && settings.launchpadDevCost) {
            launchpadCost.textContent = settings.launchpadDevCost;
        }

        /* ---- Form action ---- */
        var contactForm = document.querySelector('form[action^="mailto:"]');
        if (contactForm) {
            contactForm.setAttribute('action', 'mailto:' + settings.emailPrimary);
        }

        /* ---- Social links ---- */
        var socialLinks = document.querySelectorAll('.footer__col a');
        if (socialLinks.length >= 4) {
            var socialValues = [
                settings.socialLinkedIn,
                settings.socialGitHub,
                settings.socialX,
                settings.socialYouTube
            ];
            for (var i = 0; i < socialValues.length; i++) {
                if (socialLinks[i] && socialValues[i]) {
                    socialLinks[i].setAttribute('href', socialValues[i]);
                }
            }
        }
    }

    window.RedbeeSettings = {
        load: loadSettings,
        save: saveSettings,
        apply: applySettings,
        defaults: defaultSettings,
        storageKey: STORAGE_KEY
    };

    /* Auto-apply stored settings on page load */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            RedbeeSettings.apply(RedbeeSettings.load());
        });
    } else {
        RedbeeSettings.apply(RedbeeSettings.load());
    }
})();
