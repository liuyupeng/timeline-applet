// pages/note/save.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: 0,
        info: {},
        theme_id: 0,
        themeList: [],
        themeItems: [],
        themeIndex: 0,
        topTipText: "",
        btn_disabled: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var id = options.id || 0;
        that.setData({id: id});
        that.getInfo(id);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 获取数据
    getInfo: function (id) {
        var that = this;

        app.request({
            url: app.getRequestUrl("tickler/getEdit"),
            data: app.getRequestData({
                id: id
            }),
            success: function (result) {
                if (result.data.res == 1) {
                    var info = result.data.data.info;
                    var theme_id = info.theme_id || 0;
                    var themeList = result.data.data.themeList;

                    that.setData({
                        info: info
                    });

                    that.setThemeItems(themeList, theme_id);
                }
            }
        });
    },

    // 主题列表处理
    setThemeItems: function (themeList, theme_id) {
        themeList = themeList || this.data.themeList;

        var themeIndex = 0;
        var themeItems = [];
        for (var i in themeList) {
            themeItems.push(themeList[i]["name"]);

            if (themeList[i]["id"] == theme_id) {
                themeIndex = i;
            }
        }

        this.setData({
            theme_id: theme_id,
            themeList: themeList,
            themeItems: themeItems,
            themeIndex: themeIndex
        });
    },

    // 主题改变事件
    bindThemeChange: function (event) {
        var themeIndex = event.detail.value;
        var themeList = this["data"]["themeList"];

        this.setData({
            themeIndex: themeIndex,
            theme_id: themeList[themeIndex]["id"]
        });
    },

    // 表单提交
    bindForm: function (event) {
        var that = this;
        var formData = event.detail.value;
        formData["id"] = that.data.id;
        formData["theme_id"] = that.data.theme_id;
        formData["formId"] = event.detail.formId;
        
        that.setData({ btn_disabled: true });
        wx.showLoading({ title: "正在操作" });

        app.request({
            url: app.getRequestUrl("tickler/save"),
            data: app.getRequestData(formData),
            success: function (result) {
                wx.hideLoading();
                if (result.statusCode == 200) {
                    if (result.data.res == 1) {
                        wx.showToast({
                            title: "保存成功"
                        });

                        app.noticePublish("tickler_list_reload");
                        wx.navigateBack({ delta: 1 });
                    } else {
                        that.setData({
                            topTipText: result.data.msg,
                            btn_disabled: false
                        });

                        setTimeout(function () {
                            that.setData({
                                topTipText: ""
                            });
                        }, 3000);
                    }
                }
            }
        });
    }

})