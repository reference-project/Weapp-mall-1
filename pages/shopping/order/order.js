// pages/shopping/order/order.js
var app = getApp();
Page({
  data: {
    floatBody: true,
    checked: '',

    orderList:[],         //存储订单信息
    start: 1,             //请求页数
    perpage: 10,          //每页请求数量
    ticketList:[],        //存放礼包券
    discountId:0,         //存放券票id
    total: 0 ,            //订单总金额
    contactId:0,          //存放收货地址id
    payment_identity: 2,   //支付方式
  },

  /********  接口请求失败  **********/
  funFail: function (res) {
    console.log("failFun", res);
  },

  onLoad: function (options) {
    console.log(options);
    var that = this
    if (options.hasOwnProperty('orderddId') || options.orderddId != undefined){
      var orderddId = options.orderddId;
      that.setData({
        orderddId: orderddId
      })
      // 获取订单信息
      that.getOrderInfo();

      //获取钱包信息
      var url_wallet = app.apiUrl + '/Market/WalletDetail';
      var params_wallet = {};
      app.request.requestPostApi(url_wallet, params_wallet, this, function (res) {
        if (res.status == 200) {
          that.setData({
            walletList: res.result
          })
        } else {
          console.log(res);
        }
      }, that.failFun)

      //获取礼包券
      var start = that.data.start;
      var perpage = that.data.perpage;
      var url_tikect = app.apiUrl + '/Coupon/TicketList';
      var params_tikect = { start: start, perpage: perpage};
      app.request.requestPostApi(url_tikect, params_tikect, this, function (res) {
        if (res.status == 200) {
          that.setData({
            ticketList: res.result
          });
          console.log(that.data.ticketList);
        } else {
          console.log(res);
        }
      }, that.failFun)

      //获取当前时间
      var timestamp = Date.parse(new Date());
      var date = new Date(timestamp);
      var Y = date.getFullYear();
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      var h = date.getHours();
      var m = date.getMinutes();
      that.setData({
        timer: Y + "-" + M + "-" + D + " " + h + ":" + m
      })
    }
  },

  //获取订单详情
  getOrderInfo: function () {
    var that = this;
    var orderddId = that.data.orderddId;
    var url = app.apiUrl + "/Market/OrderddDetail";
    var params = { orderddId: orderddId };
    app.request.requestGetApi(url, params, that, function (res) {
      console.log(res);
      var list = res.result;
      var total = 0;
      if (res.status == 200) {
        if (list != null) {
          //转化时间戳处理
          // list.confirm_time = app.toDate(list.confirm_time,'time');
          // list.amount = parseFloat(list.amount).toFixed(2);
          list.freight = list.freight;
          list.total = parseFloat(list.total).toFixed(2);

          if (list.discount.hasOwnProperty("univalent")) {
            list.discount.univalent = parseFloat(list.discount.univalent).toFixed(2);
            total = (parseFloat(list.total) + parseFloat(list.freight) - parseFloat(list.discount.univalent)).toFixed(2);
            if (total < 0){
              total = 0.00
            }
            that.setData({
              discountId: list.discount.identity
            })
          }else{
            total = (parseFloat(list.freight) + parseFloat(list.total)).toFixed(2);
            if (total < 0) {
              total = 0.00
            }
          }
        }
        that.setData({
          amount: total,
          orderList: list,
          // paymentId: res.result.payment.identity,
        })
        console.log(typeof that.data.orderList.amount);
      } else {
        console.log(res);
      }
    }, that.funFail)
  },

  //跳转到收货地址页面
  address: function (res) {
    var that = this;
    var orderddId = that.data.orderddId;
    wx.navigateTo({
      url: '/pages/ucenter/addressList/addressList/addressList?orderddId=' + orderddId,
    })
  },

  //点击 礼品卡 按钮
  floatBody: function () {
    var that = this;
    that.setData({
      floatBody: false,
    })
  },

  //选择优惠礼包
  radioChange: function(e){
    console.log(e);
    var that = this;
    var id = e.detail.value;
    that.setData({
      discountId: id,
    })
  },

  //点击 取消 按钮
  cancel: function () {
    var that = this;
    that.setData({
      floatBody: true,
    })
  },

  //点击 选好了 按钮
  sure: function (e) {
    var that = this;
    var discountId = that.data.discountId;
    var orderddId = that.data.orderddId;
    var val = e.detail.value.ticket;
    console.log(val);
    if(val == ''){
      wx.showToast({
        title: '请选择礼包卡',
      })
    } else {
      // 修改订单信息
      var url = app.apiUrl + "/Market/OrderddChange";
      if (val == 0) {
        var params = {
          orderddId: orderddId,
          "property[use_discount]": 1,
          "property[discount_identity]": discountId
        };
      }else{
        var params = {
          orderddId: orderddId,
          "property[use_discount]": 1,
          "property[discount_identity]": discountId
        };
      }
      app.request.requestPostApi(url, params, that, function (res) {
        var list = res.result;
        if (res.status == 200) {
          // 获取订单信息
          that.getOrderInfo();

          that.setData({
            floatBody: true,
          })
        } else {
          console.log(res);
        }
      }, that.funFail)
    }
  },

  //是否使用账户余额
  // radio: function (e) {
  //   console.log(e);
  //   var that = this;
  //   var flag = e.currentTarget.dataset.falg;
  //   console.log(flag);
  //   if (flag) {
  //     that.setData({
  //       checked: true,
  //     })
  //   } else {
  //     that.setData({
  //       checked: false,
  //     })
  //   }
  // },

  //选择支付方式
  radio: function(e){
    console.log(e);
    var that = this;
    var checked = e.detail.value;
    that.setData({
      checked: checked
    });
  },

  //立即支付
  pay: function () {
    var that = this;
    var orderddId = that.data.orderddId;
    var paymentId = that.data.paymentId;
    var discountId = that.data.discountId;
    var payWay = that.data.checked;
    var payment_identity = that.data.payment_identity;
    console.log(payWay);
    if (payWay == ''){
      wx.showToast({
        title: '请选择支付方式',
      })
    }else{
      if (payWay == 1) {
        payment_identity = 1;
      } else {
        payment_identity = 0;
      }
      wx.showModal({
        content: '是否确认付款操作',
        success: function (res) {
          if (res.confirm) {
            if (that.data.orderList.contact.hasOwnProperty("identity")) {
              var contactId = that.data.orderList.contact.identity;
              //订单确认
              var url = app.apiUrl + '/Market/OrderddSave';
              var params = {
                discountId: discountId,
                // paymentId: paymentId,
                orderddId: orderddId,
                contactId: contactId,
                payment_identity: payment_identity,
              };
              app.request.requestPostApi(url, params, this, function (res) {
                if (res.status == 200) {
                  var complete = res.complete;
                  if (complete == 0){
                    //微信支付接口
                    var params = {
                      discountId: discountId,
                      // paymentId: paymentId,
                      orderddId: orderddId,
                      contactId: contactId,
                      payment_identity: 0,
                    };
                    app.request.requestPostApi(url, params, this, function (res) {
                      if (res.status == 200) {
                        console.log(res);
                        // wx.requestPayment({
                        //   timeStamp: res.result.payment.timeStamp,
                        //   nonceStr: res.result.payment.nonceStr,
                        //   package: res.result.payment.package,
                        //   paySign: res.result.payment.paySign,
                        //   signType: 'MD5',
                        //   // 支付成功请求回调函数
                        //   success: function (res) {
                            
                        //   },
                        //   // 支付失败请求回调函数
                        //   fail: function (res) {                                        
                        //     console.log('支付失败', res);
                        //   }
                        // })
                      }
                    }, that.failFun)

                  } else if (complete == 1){
                    //余额支付成功
                    funchangeOrder(orderddId);
                  }

                } else if (res.status == 4211) {
                  wx.showModal({
                    content: '您的账户余额不足，如果继续进行支付，将会为您跳转至微信支付',
                    success: function (res) {
                      if (res.confirm){
                        //微信支付接口
                        var params = {
                          discountId: discountId,
                          // paymentId: paymentId,
                          orderddId: orderddId,
                          contactId: contactId,
                          payment_identity: 0,
                        };
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
                            console.log('支付失败', res);
                          }
                        })

                        

                      }
                    }
                  })
                } else {
                  console.log(res);
                }


                function funchangeOrder(id) {
                  //修改订单状态
                  var url_status = app.apiUrl + '/Market/OrderddChange';
                  var params_status = {
                    orderddId: id,
                    'property[status]': 3,
                  };

                  app.request.requestPostApi(url_status, params_status, this, function (res) {
                    if (res.status == 200) {
                      console.log("修改订单状态成功");
                    } else {
                      console.log(res);
                    }
                  }, that.failFun)

                  //页面跳转
                  wx.reLaunch({
                    url: '/pages/shopping/payResult/payResult?status=' + res.status,
                  })
                }

              }, that.failFun)
            } else {
              wx.showToast({
                title: '请选择收货地址',
              })
            }
          }
        },
      })
    }
  },

})