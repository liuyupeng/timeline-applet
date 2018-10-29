// pages/note/note.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        userInfo: {},
        is_show_text: 1,
        text_msg: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        
        app.getUserInfo(function (userInfo) {
            that.setData({
                userInfo: userInfo
            });

            that.doRebind(true);
        });

        app.noticeListen("tickler_list_reload", function () {
            that.doRebind(false);
        });

        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        // wx.showNavigationBarLoading();
        this.doRebind(false);
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        this.doBindPage();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    // 初始化加载
    doRebind: function (show_loading) {
        var that = this;

        // 初始化分页参数
        that.setData({ page: 1, pages: 1, total: 0 });

        if (show_loading == true) {
            wx.showLoading({ title: '数据加载中' });
        }
        
        that.doRequest(function (dataList) {
            that.setData({ list: dataList });
        })
    },

    // 加载更多
    doBindPage: function () {
        var that = this;

        // 判断是否还有更多数据
        if (that.data.page < that.data.pages) {
            // 当前页+1
            that.setData({
                page: that.data.page + 1,
                is_show_text: 1,
                text_msg: "数据加载中"
            });

            that.doRequest(function (dataList) {
                var list = that.data.list;
                for (var i in dataList) {
                    list.push(dataList[i]);
                }

                that.setData({ list: list });
            });
        }
    },

    // 请求数据
    doRequest: function (cllBack) {
        var that = this;

        app.request({
            url: app.getRequestUrl("tickler/getList"),
            data: app.getRequestData({
                page: that.data.page
            }),
            success: function (result) {
                wx.hideLoading();
                if (result.data.res == 1) {
                    var data = result.data.data

                    cllBack(data.data);

                    if (data.total == 0) {
                        var text_msg = "您还没有添加备忘录";
                    } else if (data.has_more == 1) {
                        var text_msg = "上拉加载更多";
                    } else {
                        var text_msg = "没有更多数据了";
                    }

                    that.setData({
                        page: parseInt(data.current_page),
                        pages: parseInt(data.last_page),
                        total: parseInt(data.total),
                        is_show_text: 1,
                        text_msg: text_msg
                    });
                } else {
                    that.setData({
                        is_show_text: 1,
                        text_msg: "数据加载失败"
                    })
                }
            }
        });
    },

    bindCopy: function(event) {
        var that = this;
        var index = event.currentTarget.dataset.index;
        var note_id = event.currentTarget.dataset.id;

        that.copyInfo(index, note_id);
    },

    // 操作
    bindOpec: function(event) {
        var that = this;
        var index = event.currentTarget.dataset.index;
        var note_id = event.currentTarget.dataset.id;

        wx.showActionSheet({
            itemList: ["复制", "编辑", "删除"],
            success: function(res) {
                if (res.tapIndex == 0) {
                    // 编辑备忘录
                    that.copyInfo(index, note_id);
                } else if (res.tapIndex == 1) {
                    // 编辑备忘录
                    wx.navigateTo({
                        url: "../note/save?id=" + note_id
                    });

                } else if (res.tapIndex == 2) {
                    // 删除备忘录
                    wx.showModal({
                        title: "提示",
                        content: "删除之后不可恢复，确定要删除吗？",
                        showCancel: true,
                        success: function(res) {
                            if (res.confirm == true) {
                                that.deleteInfo(note_id);
                            }
                        }
                    });
                }
            }
        });
    },

    // 复制文本
    copyInfo: function (index, note_id){
        var that = this;
        var list = that.data.list;
        var context = list[index]["context"];

        wx.setClipboardData({
            data: context,
            success: function () {
                wx.showToast({
                    title: "复制成功"
                });
            }
        });
    },

    // 删除备忘录
    deleteInfo: function(note_id) {
        var that = this;
        var list = that.data.list;

        wx.showLoading({ title: '正在操作' });
        app.request({
            url: app.getRequestUrl("tickler/deleteInfo"),
            data: app.getRequestData({
                id: note_id
            }),
            success: function (result) {
                wx.hideLoading();
                if (result.data.res == 1) {
                    that.removeItem(note_id);

                    wx.showToast({
                        title: "删除成功"
                    });
                } else {
                    wx.showModal({
                        title: "提示",
                        content: result.data.msg,
                        showCancel: false
                    });
                }
            }
        });
    },

    // 移除一项
    removeItem: function (note_id) {
        var that = this;
        var list = that.data.list;

        var nList = [];
        for (var i in list) {
            if (list[i]["id"] != note_id) {
                nList.push(list[i]);
            }
        }

        that.setData({ list: nList });
    }
})