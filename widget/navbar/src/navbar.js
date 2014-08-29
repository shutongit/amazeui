define(function(require, exports, module) {
    require('core');

    var $ = window.Zepto,
        UI = $.AMUI,
        QRCode = require('util.qrcode'),
        modal = require('ui.modal'),
        share = require('ui.share');

    var navbarInit = function() {
        var $navBar = $('[data-am-widget="navbar"]');

        if (!$navBar.length) return;

        var $win = $(window),
            $body = $('body'),
            $navBarNav = $navBar.find('.am-navbar-nav'),
            $navItems = $navBar.find('li'),
            navItemsCounter = $navItems.length;
            configItems = $navBarNav.attr('class') && parseInt($navBarNav.attr('class').match(/sm-block-grid-(\d)/)[1]) || 3,
            navMinWidth = 60, //每个li最小宽度
            offsetWidth = 16,
            $share = $navItems.filter('[data-am-navbar-share]'),
            $qrcode = $navItems.filter('[data-am-navbar-qrcode]'),
            activeStatus = 'am-active',
            $moreActions = $('<ul class="am-navbar-actions"></ul>', {
                id: UI.utils.generateGUID('am-navbar-actions')
            }),
            $moreLink = $('<li class="am-navbar-labels am-navbar-more"><a href="javascript: void(0);"><span class="am-icon-angle-up"></span><span class="am-navbar-label">更多</span></a></li>');

        // 如果有 Fix 的工具栏则设置 body 的 padding-bottom
        if ($navBar.css('position') == 'fixed') {
            $body.addClass('with-fixed-navbar');
        }

        if ($qrcode.length) {
            var qrId = 'am-navbar-qrcode';
            $qrModal = $('#' + qrId);

            if (!$qrModal.length) {
                var qrImg = $qrcode.attr('data-am-navbar-qrcode'),
                    $qrModal = $('<div class="am-modal am-modal-no-btn" id="">' +
                    '<div class="am-modal-dialog"><div class="am-modal-bd"></div></div>' +
                    '</div>', {
                        id: qrId
                    }),
                    $qrContainer = $qrModal.find('.am-modal-bd');

                // 判断上传自定义的二维码没有，否则生成二维码
                if (qrImg) {
                    $qrContainer.html('<img src="' + qrImg + '"/>');
                } else {
                    var qrnode = new QRCode({
                        render: 'canvas',
                        correctLevel: 0,
                        text: window.location,
                        width: 200,
                        height: 200,
                        background: '#fff',
                        foreground: '#000'
                    });
                    $qrContainer.html(qrnode);
                }

                $body.append($qrModal);
            }

            $qrcode.on('click', function(e) {
                e.preventDefault();
                $qrModal.modal();
            });
        }


        if (navItemsCounter > configItems && navItemsCounter > calcSuiteItems()) {
            initActions();
        }

        function initActions() {
            $navBarNav.append($moreLink);

            $navBarNav.find('li').not('.am-navbar-more').slice(calcSuiteItems() - 1).appendTo($moreActions);

            // Append more actions
            $navBar.append($moreActions);
        }

        function checkNavBarItems() {
            // console.log('best: %d', calcSuiteItems());

            if (calcSuiteItems() >= navItemsCounter) {
                // 显示所有链接，隐藏 more
                $moreLink.hide();
                $moreActions.find('li').insertBefore($moreLink);
                return;
            }

            !$navBar.find('.am-navbar-actions').length && initActions();

            $moreLink.show();

            if ($navBarNav.find('li').length < calcSuiteItems()) {
                $moreActions.find('li').slice(0, calcSuiteItems() - $navBarNav.find('li').length).insertBefore($moreLink);
            } else if ($navBarNav.find('li').length > calcSuiteItems()) {
                if ($moreActions.find('li').length) {
                    $navBarNav.find('li').not($moreLink).slice(calcSuiteItems() - 1).insertBefore($moreActions.find('li').first());
                } else {
                    $navBarNav.find('li').not($moreLink).slice(calcSuiteItems() - 1).appendTo($moreActions);
                }
            }
        }

        /**
         * 计算最适合显示的条目个数
         * @returns {number}
         */
        function calcSuiteItems() {
            return Math.floor(($win.width() - offsetWidth) / navMinWidth);
        }
        
        $navBar.on('click.navbar.amui', '.am-navbar-more', function(e) {
            e.preventDefault();

            $moreLink[$moreActions.hasClass(activeStatus) ? 'removeClass' : 'addClass'](activeStatus);

            $moreActions.toggleClass(activeStatus);
        });

        if ($share.length) {
            $share.on('click.navbar.amui', function(e) {
                e.preventDefault();
                share.toggle();
            });
        }

        $win.on('resize.navbar.amui orientationchange.navbar.amui', UI.utils.debounce(checkNavBarItems, 150));
    };


    // DOMContent ready
    $(function() {
        navbarInit();
    });

    exports.init = navbarInit;
});
