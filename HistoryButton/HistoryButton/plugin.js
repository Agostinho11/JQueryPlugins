(function ($) {
    window.OfscPlugin = function (debugMode) {
        this.debugMode = debugMode || false;
        this._securedata = null;
    };

    let pluginOpenData = {};
    let items = {};
    let initPluginFlag  = false;
    let elem = {};

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
        pluginOpen: function (receivedData) {
            pluginOpenData = receivedData;
            const {securedData, activity} = receivedData;

            if (activity != null && initPluginFlag == false) {
                this.instanceUrl = securedData.instanceUrl;
                this.ofscRestClientId = securedData.ofscRestClientId;
                this.ofscRestClientSecret = securedData.ofscRestClientSecret;
                items = this.getSiteActivities(activity.czip);
                initPluginFlag = true;
            }
            if (items != null){
                this.buildTable();
            }

        },

        buildTable : function (){
            const _this = this;
            var page = document.getElementById('myPage');
            page.innerHTML = null;
            for (var i = 0; i < items.length; i++) {
                var row = `<tr class="bg-info" id=${items[i].activityId}>
                             <th>Activity ID</th>
                             <th>${items[i].activityId}</th>
                           </tr>`;
                page.innerHTML += row;
            }
            document.querySelectorAll(".bg-info").forEach(
                function (element) {
                    element.addEventListener('click', function () {
                        elem = element;
                        _this.clickAction();
                    });
                }
            );
        },

        clickAction : function () {
            var page = document.getElementById('myPage');
            page.innerHTML = null;
            var row = `<tr class="bg-info" id="Back"}>
                        <th>Back</th>
                        <th></th>
                       </tr>`;
            page.innerHTML += row;
            var activity = this.getActivity(elem.id);
            if (activity !=  null){
                for (var j = 0; j < Object.keys(activity).length; j++) {
                    var infoRow = `<tr>
                                <td>${Object.keys(activity)[j]}</td>
                                <td>${Object.values(activity)[j]}</td>`;

                    if (Object.keys(activity)[j] == 'requiredInventories' ){
                        infoRow = `<tr class="bg-info" id="Inventory"}>
                                <th>Inventory</th>
                                <th></th>
                               </tr>`;

                        page.innerHTML += infoRow;

                        document.getElementById("Inventory").addEventListener('click', this.clickInventoryAction.bind(this));
                        break;
                    }
                    page.innerHTML += infoRow;
                }
                document.getElementById("Back").addEventListener('click', this.buildTable.bind(this));
            }

        },

        clickInventoryAction : function (){
            var page = document.getElementById('myPage');
            page.innerHTML = null;

            //Get Inventories
            var inventories = [{ "inventoryId": 20997195, "status": "provider", "inventoryType": "AT", "serialNumber": "PMUD106F8", "quantity": 1, "activityId": "781816"},{ "inventoryId": 20997195, "status": "provider", "inventoryType": "AT", "serialNumber": "PMUD106F8", "quantity": 1, "activityId": "781816"},{ "inventoryId": 20997195, "status": "provider", "inventoryType": "AT", "serialNumber": "PMUD106F8", "quantity": 1, "activityId": "781816"}];
            if (inventories != null){

                var backRow = `<tr class="bg-info" id="Back"}>
                            <th>Back</th>
                           </tr>`;
                page.innerHTML += backRow;

                var headerRow = `<tr class="bg-info" id="header"}>
                                    <th>${Object.keys(inventories[0])[0]}</th>
                                 </tr>`;
                page.innerHTML += headerRow;

                for (var j = 0; j< inventories.length; j++) {
                    var bodyRow = `<tr id=${"bodyTable"+ j}>
                               </tr>`;
                    page.innerHTML += bodyRow;
                    for (var i = 0; i < Object.keys(inventories[0]).length; i++) {
                        if (j == 0 && i > 0) {
                            backRow = `<th></th>`;
                            headerRow = `<th>${Object.keys(inventories[j])[i]}</th>`
                            document.getElementById('Back').innerHTML += backRow;
                            document.getElementById('header').innerHTML += headerRow;
                        }
                        bodyRow = `<td>${Object.values(inventories[j])[i]}</td>`;
                        document.getElementById("bodyTable"+ j).innerHTML += bodyRow;
                    }
                }
                document.getElementById("Back").addEventListener('click', this.clickAction.bind(this));
            }
        },

        /**
         * Get Activity rest api
         *
         * @param {const} resource - Const that have the activity id
         */
        getActivity: function (activityId){
            let activity;
            var basic = btoa(this.ofscRestClientId + ':' + this.ofscRestClientSecret);
            $.ajax({
                url: this.instanceUrl + '/rest/ofscCore/v1/activities/'+ activityId,
                type: 'GET',
                dataType: 'json',
                contentType: "application/json",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + basic);
                }, async: false
            }).done(function (data) {
                activity = data;
            }).fail(function (xhr, textStatus){
                activity = null;
            });
            return activity;
        },

        /**
         * Search Activity by postal Code
         *
         * @param {const} postalCode - Const that have the postal Code info
         */
        getSiteActivities: function (postalCode){
            let items;
            var date = this.systemDate();
            var basic = btoa(this.ofscRestClientId + ':' + this.ofscRestClientSecret);

            $.ajax({
                url: this.instanceUrl + '/rest/ofscCore/v1/activities/custom-actions/search?searchInField=postalCode&searchForValue='+ postalCode +'&dateFrom=' + date + '&dateTo=' + date,
                type: 'GET',
                dataType: 'json',
                contentType: "application/json",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + basic);
                }, async: false
            }).done(function (data) {
                items = data.items;
            }).fail(function (xhr, textStatus){
                items = null;
            });

            return items;
        },

        systemDate : function(){
            date = new Date()
            const year = date.toLocaleString('default', {year: 'numeric'});
            const month = date.toLocaleString('default', {month: '2-digit'});
            const day = date.toLocaleString('default', {day: '2-digit'});
            return [year, month, day].join('-');
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

            console.log(data);

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
                    this.pluginOpen(data);
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
