/*

TemplateMo 619 Axis Industrial

https://templatemo.com/tm-619-axis-industrial

*/

/* ============================================================
   AXIS INDUSTRIAL — COMMON JAVASCRIPT
   ============================================================ */

(function () {
    'use strict';

    /* ---- UTC Clock ---- */
    const clockEl = document.getElementById('utcClock');
    if (clockEl) {
        function updateClock() {
            const n = new Date();
            clockEl.textContent =
                String(n.getUTCHours()).padStart(2, '0') + ':' +
                String(n.getUTCMinutes()).padStart(2, '0') + ':' +
                String(n.getUTCSeconds()).padStart(2, '0') + ' UTC';
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    /* ---- Mobile Nav Toggle ---- */
    const burger = document.getElementById('headerBurger');
    const nav = document.getElementById('headerNav');
    if (burger && nav) {
        burger.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            burger.setAttribute('aria-expanded', isOpen);
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---- Motion System (bi-directional, repeatable, nested) ---- */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        var lastScrollY = window.scrollY || 0;
        var scrollDirection = 'down';

        window.addEventListener('scroll', function () {
            var currentY = window.scrollY || 0;
            scrollDirection = currentY >= lastScrollY ? 'down' : 'up';
            lastScrollY = currentY;
        }, { passive: true });

        var extraRevealSelectors = [
            '.hero__title',
            '.hero__stats > div',
            '#services .bento-card',
            '#launchpad .stack__card',
            '#portfolio .bento-card',
            '#contact .bento-card',
            '#contact .stack__card',
            '#about .about__text',
            '#about .about__links'
        ];

        extraRevealSelectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                if (!el.classList.contains('reveal')) {
                    el.classList.add('reveal');
                }
            });
        });

        var childMotionRoots = document.querySelectorAll(
            '#services .bento-card, #launchpad .stack__card, #portfolio .bento-card, #contact .bento-card, #contact .stack__card'
        );

        childMotionRoots.forEach(function (root) {
            var childTargets = root.querySelectorAll(
                '.bento-card__number, .bento-card__title, .bento-card__text, .bento-card__stat, .bar-chart, .bar-track, .tag, .stack__card-step, .stack__card-title, .stack__card-text, .stack__card-tags, form > div'
            );
            childTargets.forEach(function (child, index) {
                child.classList.add('reveal-child');
                child.style.transitionDelay = (0.08 + (index * 0.06)) + 's';
            });
        });

        var heroTitle = document.querySelector('.hero__title');
        if (heroTitle) {
            var heroLines = heroTitle.querySelectorAll('.line');
            heroLines.forEach(function (line, index) {
                line.classList.add('reveal-child');
                line.style.transitionDelay = (0.1 + (index * 0.1)) + 's';
            });
        }

        var heroNumbers = document.querySelectorAll('.hero__stat-num');
        var heroNumberData = new WeakMap();

        heroNumbers.forEach(function (el) {
            var textNode = null;
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3 && el.childNodes[i].nodeValue.trim()) {
                    textNode = el.childNodes[i];
                    break;
                }
            }
            if (!textNode) {
                return;
            }
            var target = parseFloat(textNode.nodeValue.trim());
            if (!isNaN(target)) {
                var decimals = textNode.nodeValue.indexOf('.') > -1 ? textNode.nodeValue.trim().split('.')[1].length : 0;
                heroNumberData.set(el, {
                    node: textNode,
                    target: target,
                    decimals: decimals
                });
            }
        });

        function runHeroCounter(el) {
            var meta = heroNumberData.get(el);
            if (!meta) {
                return;
            }
            el.classList.remove('is-glitching');
            void el.offsetWidth;
            el.classList.add('is-glitching');
            var start = performance.now();
            var duration = 8000;

            function tick(now) {
                var progress = Math.min((now - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var value = meta.target * eased;
                meta.node.nodeValue = meta.decimals ? value.toFixed(meta.decimals) : Math.round(value).toString();
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            }

            meta.node.nodeValue = meta.decimals ? (0).toFixed(meta.decimals) : '0';
            requestAnimationFrame(tick);
        }

        function resetHeroCounter(el) {
            var meta = heroNumberData.get(el);
            if (!meta) {
                return;
            }
            meta.node.nodeValue = meta.decimals ? (0).toFixed(meta.decimals) : '0';
        }

        function prepBars(root) {
            var bars = root.querySelectorAll('.bar-track__fill');
            bars.forEach(function (bar) {
                if (!bar.dataset.targetWidth) {
                    bar.dataset.targetWidth = bar.style.width || '100%';
                }
                bar.style.width = '0%';
            });
        }

        function revealBars(root) {
            var bars = root.querySelectorAll('.bar-track__fill');
            bars.forEach(function (bar, index) {
                var targetWidth = bar.dataset.targetWidth || bar.style.width || '100%';
                setTimeout(function () {
                    bar.style.width = targetWidth;
                }, 220 + (index * 80));
            });
        }

        var reveals = document.querySelectorAll('.reveal');
        reveals.forEach(function (el) {
            prepBars(el);
        });

        if (reveals.length) {
            var revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var target = entry.target;
                    var parent = target.parentElement;
                    var siblingIndex = 0;

                    if (parent) {
                        var siblings = Array.prototype.filter.call(parent.children, function (child) {
                            return child.classList && child.classList.contains('reveal');
                        });
                        siblingIndex = siblings.indexOf(target);
                        if (siblingIndex < 0) {
                            siblingIndex = 0;
                        }
                    }

                    target.style.transitionDelay = (siblingIndex * 0.08) + 's';
                    target.classList.remove('reveal--from-up', 'reveal--from-down');
                    target.classList.add(scrollDirection === 'up' ? 'reveal--from-up' : 'reveal--from-down');

                    if (entry.isIntersecting) {
                        if (target.dataset.animationDone) {
                            target.classList.add('visible');
                            revealBars(target);
                            return;
                        }
                        target.dataset.animationDone = 'true';
                        target.classList.add('visible');
                        if (target.matches('.hero__title')) {
                            target.classList.remove('is-glitching');
                            void target.offsetWidth;
                            target.classList.add('is-glitching');
                        }
                        if (target.matches('.hero__stats > div')) {
                            var heroStatNumber = target.querySelector('.hero__stat-num');
                            if (heroStatNumber) {
                                runHeroCounter(heroStatNumber);
                            }
                        }
                        revealBars(target);
                    } else {
                        target.classList.remove('visible');
                    }
                });
            }, {
                threshold: 0.34,
                rootMargin: '0px 0px -20% 0px'
            });

            reveals.forEach(function (el) {
                revealObserver.observe(el);
            });
        }

        /* ---- Auto-trigger hero animations when the hero GIF animation ends ---- */
        function triggerHeroAnimations() {
            var heroTitle = document.querySelector('.hero__title');
            if (heroTitle) {
                heroTitle.dataset.animationDone = 'true';
                heroTitle.classList.add('visible');
                heroTitle.classList.remove('is-glitching');
                void heroTitle.offsetWidth;
                heroTitle.classList.add('is-glitching');
            }

            var heroBottomReveals = document.querySelectorAll('.hero__bottom .reveal');
            heroBottomReveals.forEach(function (el, index) {
                el.style.transitionDelay = (index * 0.08) + 's';
                el.dataset.animationDone = 'true';
                el.classList.add('visible');
            });

            var heroStatNumbers = document.querySelectorAll('.hero__stat-num');
            heroStatNumbers.forEach(function (num) {
                runHeroCounter(num);
            });

            revealBars(document.querySelector('.hero__bottom'));
        }

        var heroGif = document.querySelector('.hero__bg-gif');
        var gifAnimationDone = false;
        var heroAnimationsTriggered = false;

        function onGifAnimationEnd() {
            if (heroAnimationsTriggered) {
                return;
            }
            heroAnimationsTriggered = true;
            gifAnimationDone = true;
            if (heroGif) {
                heroGif.removeEventListener('animationend', onGifAnimationEnd);
            }
            triggerHeroAnimations();
        }

        if (heroGif) {
            heroGif.addEventListener('animationend', onGifAnimationEnd);
            setTimeout(onGifAnimationEnd, 1000);
            setTimeout(function () {
                if (!gifAnimationDone) {
                    onGifAnimationEnd();
                }
            }, 3000);
        } else {
            setTimeout(triggerHeroAnimations, 1000);
        }
    } else {
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // Removed duplicate triggerHeroAnimations and setTimeout (lines 272-302) - they are inside the if block now
    var backTop = document.getElementById('backToTop');
    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

})();
