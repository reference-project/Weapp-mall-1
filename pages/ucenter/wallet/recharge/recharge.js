// pages/ucenter/wallet/recharge/recharge.js
var app = getApp();
Page({

  data: {
    amount: '',      //金额
    walletStreamId: "",
  },
  // 接口调用失败
  Funfail: function (res) {
    console.log(res);
  },

  // 加载获取数据
  onLoad: function (options) {
    var that = this;
  },
  // 获取输入框的值
  rechar: function (e) {
    var that = this;
    var amount = e.detail.value;
    that.setData({
      amount: amount,
    })
  },

  // 点击按钮充值
  recharge: function (e) {
    var that = this;
    var amount = that.data.amount;
    var url = app.apiUrl + "/Market/WalletDeposit";
    var params = {
      amount: amount,
    }
    console.log(amount)
    // 调用网络接口
    app.request.requestPostApi(url, params, this, function (res) {
      if (res.status == 200) {
        if (res.result.payment != null) {
          var walletStreamId = res.walletStreamId;          
          wx.requestPayment({
            timeStamp: res.result.payment.timeStamp,
            nonceStr: res.result.payment.nonceStr,
            package: res.result.payment.package,
            paySign: res.result.payment.paySign,
            signType: 'MD5',
            // 支付成功请求回调函数
            success: function (res) {
              var that = this;
              var url = app.apiUrl + "/Market/WalletDepositSave";
              var params = {
                walletStreamId: walletStreamId,
              }
              // 调用支付接口。请求回调，判断支付成功还是失败
              app.request.requestGetApi(url, params, this, function (res) {
                if (res.status == 200) {
                  wx.reLaunch({
                    url: '/pages/ucenter/ucenter/ucenter?walletStreamId=walletStreamId&pagestatus=success',
                  })
                } else {
                  wx.reLaunch({
                    url: '/pages/ucenter/ucenter/ucenter?walletStreamId=walletStreamId&pagestatus=fail',
                  })
                }
              }, this.Funfail)
            },
            // 支付失败请求回调函数
            fail: function (res) {
              wx.reLaunch({
                url: '/pages/ucenter/ucenter/ucenter?walletStreamId=walletStreamId&pagestatus=fail',
              })
              console.log('支付失败',res);
            }
          })
        }
      }
    }, this.Funfail)
  }
})