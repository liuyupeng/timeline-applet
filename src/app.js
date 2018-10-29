//app.js
App({
    onLaunch: function () {
        var that = this;

        // 调用API从本地缓存中获取数据
        var userInfo = wx.getStorageSync("SESSION_TIMELINE_USER_INFO");
        if (userInfo && userInfo.wx_openid) {
            wx.checkSession({
                success: function () {
                    that.setUserInfo(userInfo);
                },
                fail: function () {
                    // 登录态过期重新登录
                    // that.doLogin();
                }
            });
        } else {
            // that.doLogin();
        }
    },

    globalData: {
        _page_data: {},
        _user_info: null,
        http_url: "https://m.lypeng.cn/",
        foot_text: "时光记事本",
        copyright: "2018 lovenLiu"
    },

    // 获取接口请求地址
    getRequestUrl: function (action) {
        return this.globalData.http_url + action
    },

    // 获取请求携带数据
    getRequestData: function (formData) {
        formData = formData || {};
        var userInfo = this.globalData._user_info;
        var signature = userInfo ? userInfo.access_token : "";
        formData["signature"] = signature;

        return formData;
    },

    // 接口请求
    request: function (options) {
        var that = this;
        var _default = {
            method: "POST",
            header: { "Content-Type": "application/x-www-form-urlencoded" },
            fail: function (e) {
                wx.showModal({
                    title: "提示",
                    content: "请求失败" + JSON.stringify(e),
                    showCancel: false
                });
            }
        };

        for (var i in options) {
            // if (i != "success") {
                _default[i] = options[i];
            // }
        }

        // _default["success"] = function (result) {
        //     if (result.data.status == 0) {
        //         wx.hideLoading();
        //         if (result.data.error == "auth") {
        //             that.removeUserInfo();
        //             that.doLogin();

        //             wx.showModal({
        //                 title: "提示",
        //                 content: "请求失败",
        //                 showCancel: false
        //             });
        //             return false;
        //         }
        //     }

        //     if (typeof options["success"]) {
        //         options["success"](result);
        //     }
        // }

        wx.request(_default);
    },

    // 设置用户信息
    setUserInfo: function (userInfo) {
        this.globalData["_user_info"] = userInfo;
        wx.setStorageSync("SESSION_TIMELINE_USER_INFO", userInfo);
    },

    // 移除用户信息
    removeUserInfo: function () {
        // 用户信息清除同步清除本地缓存
        this.globalData["_user_info"] = null;
        wx.removeStorageSync("SESSION_TIMELINE_USER_INFO");
    },

    // 获取用户信息
    getUserInfo: function (callBack) {
        var that = this;
        var userInfo = that.globalData["_user_info"];

        if (userInfo && userInfo.wx_openid) {
            typeof callBack == "function" && callBack(userInfo);
        } else {
            // 未登录去登录
            that.doLogin(callBack);
        }
        
        return userInfo;
    },

    // 登录
    doLogin: function (callBack) {
        var that = this;
        wx.login({
            success: function (res) {
                wx.request({
                    method: "POST",
                    header: { "Content-Type": "application/x-www-form-urlencoded" },
                    url: that.getRequestUrl("index/wxlogin"),
                    data: {
                        signature: "4d962ff2b613d9e6",
                        wx_code: res.code
                    },
                    success: function (result) {
                        if (result.data.res == 1) {
                            var userInfo = result.data.data;
                            that.setUserInfo(userInfo);
                            typeof callBack == "function" && callBack(userInfo);

                        } else { // 用户信息获取失败
                            wx.showModal({
                                title: "提示",
                                content: "用户信息获取失败",
                                showCancel: false
                            });
                        }
                    }
                });
            }
        });
    },

    // 获取页面传值
    getPageData: function () {
        return this.globalData["_page_data"];
    },

    // 设置页面传值
    setPageData: function (data) {
        this.globalData["_page_data"] = data || {};
    },
    
    // 广播事件监听
    _listen_fns: {},
    noticeListen: function (key, callback) {
        this._listen_fns[key] = callback;
    },

    // 广播事件发布
    noticePublish: function (key, data) {
        var _listen_fns = this._listen_fns;
        if (_listen_fns[key]) {
            if (typeof _listen_fns[key] == "function") {
                try {
                    _listen_fns[key](data);
                } catch (e) {
                    console.log("publish error");
                }
            }
        }
    }
})