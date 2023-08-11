(function ($) {
    window.OfscPlugin = function (debugMode) {
        this.debugMode = debugMode || false;
        this._securedata = null;
    };
    $.extend(window.OfscPlugin.prototype, {

        /**
         * Check for string is valid JSON
         *
         * @param {*} str - String that should be validated
         *
         * @returns {boolean}
         *
         * @private
         */
        _isJson: function (str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        },

        /**
         * Business login on plugin open
         */
        pluginOpen: function () {
            $('#en-link-selector').show();
            $('#en-button-selector').show();
        },

        scrollToLinkSection: function () {

            window.addEventListener('DOMContentLoaded', () => {

                document.getElementById('en-link-selector').scrollIntoView(true);
                document.getElementById('en-button-selector').scrollIntoView(true);
            });
        },

        /**
         * Business login on plugin init end
         *
         * @param {Object} data - JSON object that contain data from OFSC
         */
        pluginInitEnd: function (data) {
            this.saveToLocalStorage(data);

            const messageData = {
                apiVersion: 1,
                method: 'initEnd'
            };

            if (localStorage.getItem('pluginWakeupCount') < localStorage.getItem('pluginWakeupMaxCount')) {
                this._log(window.location.host + ' UNFINISHED WAKEUP DATA FOUND IN LOCAL STORAGE');

                messageData.wakeupNeeded = true;
            }

            this._sendPostMessageData(messageData);
        },

        /**
         * Business login on plugin init
         */
        saveToLocalStorage: function (data) {
            this._log(window.location.host + ' INIT. SET DATA TO LOCAL STORAGE', JSON.stringify(data, null, 4));

            const initData = {};

            $.each(data, function (key, value) {
                if (-1 !== $.inArray(key, ['apiVersion', 'method'])) {
                    return true;
                }

                initData[key] = value;
            });

            localStorage.setItem('pluginInitData', JSON.stringify(initData));
        },

        /**
         * Handles during receiving postMessage
         *
         * @param {MessageEvent} event - Javascript event
         *
         * @private
         */
        _getPostMessageData: function (event) {
            if (typeof event.data === 'undefined') {
                this._log(window.location.host + ' <- NO DATA ' + this._getDomain(event.origin), null, null, true);

                return false;
            }

            if (!this._isJson(event.data)) {
                this._log(window.location.host + ' <- NOT JSON ' + this._getDomain(event.origin), null, null, true);

                return false;
            }

            const data = JSON.parse(event.data);

            console.log(data)

            if (!data.method) {
                this._log(window.location.host + ' <- NO METHOD ' + this._getDomain(event.origin), null, null, true);

                return false;
            }

            this._log(window.location.host + ' <- ' + data.method + ' ' + this._getDomain(event.origin), JSON.stringify(data, null, 4));

            switch (data.method) {
                case 'init':
                    this.pluginInitEnd(data);
                    break;
                case 'open':
                    this.pluginOpen();
                    break;
                default:
                    this._log(window.location.host + ' <- UNKNOWN METHOD: ' + data.method + ' ' + this._getDomain(event.origin), null, null, true);
                    break;
            }
        },

        /**
         * Return origin of URL (protocol + domain)
         *
         * @param {String} url
         *
         * @returns {String}
         *
         * @private
         */
        _getOrigin: function (url) {
            if (url !== '') {
                if (url.indexOf("://") > -1) {
                    return 'https://' + url.split('/')[2];
                } else {
                    return 'https://' + url.split('/')[0];
                }
            }

            return '';
        },
        /**
         * Return domain of URL
         *
         * @param {String} url
         *
         * @returns {String}
         *
         * @private
         */
        _getDomain: function (url) {
            if (url !== '') {
                if (url.indexOf("://") > -1) {
                    return url.split('/')[2];
                } else {
                    return url.split('/')[0];
                }
            }

            return '';
        },

        /**
         * Sends postMessage to document.referrer
         *
         * @param {Object} data - Data that will be sent
         *
         * @private
         */
        _sendPostMessageData: function (data) {
            let originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';
            let isString = 'string' === typeof data;

            if (originUrl) {
                this._log(window.location.host + ' -> ' + (isString ? '' : data.method) + ' ' + this._getDomain(originUrl), isString ? data : JSON.stringify(data, null, 4));

                parent.postMessage(data, this._getOrigin(originUrl));
            } else {
                this._log(window.location.host + ' -> ' + (isString ? '' : data.method) + ' ERROR. UNABLE TO GET REFERRER');
            }
        },
        /**
         * Logs to console
         *
         * @param {String} title - Message that will be log
         * @param {String} [data] - Formatted data that will be collapsed
         * @param {String} [color] - Color in Hex format
         * @param {Boolean} [warning] - Is it warning message?
         *
         * @private
         */
        _log: function (title, data, color, warning) {
            if (!this.debugMode) {
                return;
            }
            if (!color) {
                color = '#0066FF';
            }
            if (!!data) {
                console.groupCollapsed('%c[Plugin API] ' + title, 'color: ' + color + '; ' + (!!warning ? 'font-weight: bold;' : 'font-weight: normal;'));
                console.log('[Plugin API] ' + data);
                console.groupEnd();
            } else {
                console.log('%c[Plugin API] ' + title, 'color: ' + color + '; ' + (!!warning ? 'font-weight: bold;' : ''));
            }
        },

        /**
         * Initialization function
         */
        init: function () {
            this.startApplication();
        },

        startApplication: function () {
            this._log(window.location.host + ' PLUGIN HAS BEEN STARTED');

            window.addEventListener("message", this._getPostMessageData.bind(this), false);

            const jsonToSend = {
                apiVersion: 1,
                method: 'ready',
                sendInitData: true,
                showHeader: true,
                enableBackButton: true
            };

            this._sendPostMessageData(jsonToSend);
        }
    })

})(jQuery);

function excuteGoogle() {
    if (confirm("Open Google?")) {
        window.open("https://www.google.com/");
    }
}
function excuteYoutube() {
    if (confirm("Open Youtube?")) {
        window.open("https://www.youtube.com/");
    }
}