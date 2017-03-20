var pm25 = (function() {
    // 保存数据的变量，重新渲染页面时会用到
    var aqiRanking,weatherDetail,weather24Hours,weatherWeek;
    // 数据存放目录
    var baseUrl = './data/';
    // 当前城市
    var city = '';
    // jquery变量缓存
    var jqMap = {
        $defaultCity : $(".js-default-city"),
        $cityList:$(".js-city-list"),
        $todayTemperature:$(".js-today-temperature"),
        $todaySun:$(".js-today-sun"),
        $todayHumidity:$(".js-today-humidity"),
        $todayWind:$(".js-today-wind"),
        $todayAqi:$(".js-today-aqi"),
        $todayQuality:$(".js-today-quality")
    }

    // 获取全部数据，根据数据渲染页面
    function render() {
        // pm25数据来源http://pm25.in/，接口有调用次数限制，所以保存到本地
        // pm25本地数据接口
        var aqiUrl = baseUrl + 'aqi_ranking.json'
        // 天气详情数据接口
        var weatherDetailUrl = baseUrl + 'weather_today_detail.json'
        // 24小时天气接口
        var weather24HoursUrl = baseUrl + 'weather_24_hours.json'
        // 一周天气接口
        var weatherWeekUrl = baseUrl + 'weather_week.json'
        _ajax(aqiUrl, function(data) {
            aqiRanking = data
            // 渲染所有和aqi有关的图表，重新渲染时传入aqiRanking即可
            _renderAqi(data)
        })
        _ajax(weatherDetailUrl, function(data) {
            weatherDetail = data
            // 渲染今天天气详情有关的图表，重新渲染时传入weatherDetail即可
            _renderWeatherDetail(data)
        })
        _ajax(weather24HoursUrl, function(data) {
            weather24Hours = data
            // 渲染24小时天气有关的图表，重新渲染时传入weather24Hours即可
            readerWeather24Hours(data)
        })
        _ajax(weatherWeekUrl, function(data) {
            weatherWeek = data
            // 渲染一周天气有关的图表，重新渲染时传入weatherWeek即可
            _renderWeatherWeek(data)
        })
    }
    // 渲染所有和aqi有关的图表，参数aqi_ranking.json
    function _renderAqi(data) {
        var aqiRanking = data
        var cityAqiTitle,
            cityAqiData,
            cityAqiDetailData,
            cityData = [],
            chinaAqi = [];
            // var cityApiValue = aqiRanking.forEach()
        // console.log(typeof aqiRanking)
        aqiRanking.forEach(function (value) {
            if (value.area === city) {
                var time = value.time_point.substring(value.time_point.indexOf('T') + 1,value.time_point.indexOf('Z'))
                cityAqiTitle = value.area + '全城平均\n' + time
                cityAqiData = {
                    name : value.quality,
                    value : value.aqi
                }
                cityAqiDetailData = [
                    {
                        name: "pm10",
                        value: value.pm10
                    }, {
                        name: "pm2_5",
                        value: value.pm2_5
                    }, {
                        name: "no2",
                        value: value.no2
                    }, {
                        name: "so2",
                        value: value.so2
                    }, {
                        name: "o3",
                        value: value.o3
                    }, {
                        name: "co",
                        value: value.co
                    }
                ]
            }
            chinaAqi.push({
                name : value.area,
                value : value.aqi
            })
            cityData.push(value.area)
        })
        _renderCityAqi(cityAqiTitle, cityAqiData)
        _renderCityAqiDetail(cityAqiDetailData)
        _renderWeatheraAqi(cityAqiData)
        _renderChinaAqi(chinaAqi)
        _renderAqiCity(cityData)
    }
    // 渲染今天天气
    function _renderWeatherDetail(data) {
        jqMap.$todayTemperature.text(data.temperature)
        jqMap.$todaySun.text(data.weather)
        jqMap.$todayHumidity.text(data.humidity)
        jqMap.$todayWind.text(data.wind)
    }
    // 渲染今天天气空气指数与空气质量
    function _renderWeatheraAqi(data) {
        jqMap.$todayAqi.text(data.value)
        jqMap.$todayQuality.text(data.name)
    }
    // 渲染空气污染仪表图
    function _renderCityAqi(title, data) {
        var cityAqiChart = echarts.init(document.getElementById('city-aqi'));
        var option = {
            title: {
                text: title,
                left: 'center',
                bottom: '20',
                textStyle: {
                    color: '#999',
                    fontWeight: 'normal',
                    fontSize: 　12,
                }
            },
            series: [{

                type: 'gauge',
                max: 500,
                axisTick: {
                    lineStyle: {
                        color: "#999",
                        width: 1
                    },
                    length: -14,
                    splitNumber: 1
                },
                axisLine: {
                    lineStyle: {
                        color: [

                            [.25, new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 1,
                                color: '#88c504'
                            }, {
                                offset: 0,
                                color: '#daff00'
                            }])],
                            [.5, new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 1,
                                color: '#daff00'
                            }, {
                                offset: 0,
                                color: '#ed6c00'
                            }])],
                            [.75, new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 1,
                                color: '#4c137a'
                            }, {
                                offset: 0,
                                color: '#ed6c00'
                            }])],
                            [1, new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 1,
                                color: '#400633'
                            }, {
                                offset: 0,
                                color: '#4c137a'
                            }])]
                        ]
                    }
                },
                axisLabel: {
                    distance: -60,
                    textStyle: {
                        "color": "#999"
                    }
                },
                splitLine: {
                    show: false
                },
                detail: {
                    formatter: function(value) {
                        return value + '\n' + data.name
                    },
                    offsetCenter: [0, "-34%"],
                    textStyle: {
                        fontSize: 20,
                        lineHeight:30,
                        color: "#87c20a"
                    }
                },
                data: data.value
            }]
        };
        cityAqiChart.setOption(option);
    }
    // 渲染空气污染柱形图
    function _renderCityAqiDetail(data) {
        var cityAqiChart = echarts.init(document.getElementById('city-aqi-info'));
        var option = {
            grid: {
                top: 10,
                bottom: 20,
                left: 160,
                right: 160
            },
            xAxis: {
                type: 'category',
                data: data.map(function(value) {
                   return value.name.toUpperCase()
                }),
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255,255,255,0)'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#333'
                    }
                }
            },
            yAxis: {
                splitLine: false,
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255,255,255,0)'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(255,255,255,1)'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: 'rgba(255,255,255,1)'
                    }
                }
            },
            series: [{
                type: 'bar',
                data: data.map(function(value) {
                   return value.value
                }),
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        textStyle: {
                            color: '#333'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#87c20a'
                    }
                }
            }]
        };
        cityAqiChart.setOption(option);
    }
    // 渲染24小时天气折线图
    function readerWeather24Hours(data) {
        var weather24HoursChart = echarts.init(document.getElementById('weather-24-hours'));
        var option = {
            grid: {
                top: 20,
                bottom: 20,
                left: 40,
                right: 40
            },
            tooltip : {
                trigger: 'axis',
                formatter : function (params) {
                    return params[0].name + '<br>气温：' + params[0].value + "℃"
                }
            },    
            xAxis: {
                data: data.map(function (value) {
                    return value.hour
                })
            },
            yAxis: {
                 axisLabel: {
                    formatter: '{value} ℃'
                }
            },
            series: [{
                type: 'line',
                data: data.map(function (value) {
                    return {
                        name : value.hour,
                        value : value.temperature
                    }
                }),
                markLine: {
                    // symbol : "arrow",
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                }
            }]
        };
        weather24HoursChart.setOption(option);
    }
    // 渲染一周天气有关的图表
    function _renderWeatherWeek(data) {
        var weather24HoursChart = echarts.init(document.getElementById('weather-week'));
        var option = {
            grid: {
                top: 40,
                bottom: 20,
                left: 40,
                right: 40
            },
            legend : {
                data : ["最高气温","最低气温"]
            },
            tooltip : {
                trigger: 'axis',
            },    
            xAxis: {
                data: data.map(function (value) {
                    return value.week
                })
            },
            yAxis: {
                 axisLabel: {
                    formatter: '{value} ℃'
                },
                axisLine : {
                    onZero : true
                }
            },
            series: [{
                name : "最高气温",
                type: 'line',
                data: data.map(function (value) {
                    return value.max
                }),
                markLine: {
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                },
                markPoint : {
                    data : [
                        {type : 'max',name : '最大值'},
                        {type : 'min',name : '最小值'}
                    ]
                }
            },{
                name : "最低气温",
                type: 'line',
                data: data.map(function (value) {
                    console.log(data)
                    return value.min
                }),
                markLine: {
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                },
                markPoint : {
                    data : [
                        {type : 'max',name : '最大值'},
                        {type : 'min',name : '最小值'}
                    ]
                }
            }]
        };
        weather24HoursChart.setOption(option);
    }
    // 渲染全国污染热力图
    function _renderChinaAqi(data) {
        var chinaAqiChart = echarts.init(document.getElementById('pm25-china-map'));
        var geoCoordMap = {
            "海门":[121.15,31.89],
            "鄂尔多斯":[109.781327,39.608266],
            "招远":[120.38,37.35],
            "舟山":[122.207216,29.985295],
            "齐齐哈尔":[123.97,47.33],
            "盐城":[120.13,33.38],
            "赤峰":[118.87,42.28],
            "青岛":[120.33,36.07],
            "乳山":[121.52,36.89],
            "金昌":[102.188043,38.520089],
            "泉州":[118.58,24.93],
            "莱西":[120.53,36.86],
            "日照":[119.46,35.42],
            "胶南":[119.97,35.88],
            "南通":[121.05,32.08],
            "拉萨":[91.11,29.97],
            "云浮":[112.02,22.93],
            "梅州":[116.1,24.55],
            "文登":[122.05,37.2],
            "上海":[121.48,31.22],
            "攀枝花":[101.718637,26.582347],
            "威海":[122.1,37.5],
            "承德":[117.93,40.97],
            "厦门":[118.1,24.46],
            "汕尾":[115.375279,22.786211],
            "潮州":[116.63,23.68],
            "丹东":[124.37,40.13],
            "太仓":[121.1,31.45],
            "曲靖":[103.79,25.51],
            "烟台":[121.39,37.52],
            "福州":[119.3,26.08],
            "瓦房店":[121.979603,39.627114],
            "即墨":[120.45,36.38],
            "抚顺":[123.97,41.97],
            "玉溪":[102.52,24.35],
            "张家口":[114.87,40.82],
            "阳泉":[113.57,37.85],
            "莱州":[119.942327,37.177017],
            "湖州":[120.1,30.86],
            "汕头":[116.69,23.39],
            "昆山":[120.95,31.39],
            "宁波":[121.56,29.86],
            "湛江":[110.359377,21.270708],
            "揭阳":[116.35,23.55],
            "荣成":[122.41,37.16],
            "连云港":[119.16,34.59],
            "葫芦岛":[120.836932,40.711052],
            "常熟":[120.74,31.64],
            "东莞":[113.75,23.04],
            "河源":[114.68,23.73],
            "淮安":[119.15,33.5],
            "泰州":[119.9,32.49],
            "南宁":[108.33,22.84],
            "营口":[122.18,40.65],
            "惠州":[114.4,23.09],
            "江阴":[120.26,31.91],
            "蓬莱":[120.75,37.8],
            "韶关":[113.62,24.84],
            "嘉峪关":[98.289152,39.77313],
            "广州":[113.23,23.16],
            "延安":[109.47,36.6],
            "太原":[112.53,37.87],
            "清远":[113.01,23.7],
            "中山":[113.38,22.52],
            "昆明":[102.73,25.04],
            "寿光":[118.73,36.86],
            "盘锦":[122.070714,41.119997],
            "长治":[113.08,36.18],
            "深圳":[114.07,22.62],
            "珠海":[113.52,22.3],
            "宿迁":[118.3,33.96],
            "咸阳":[108.72,34.36],
            "铜川":[109.11,35.09],
            "平度":[119.97,36.77],
            "佛山":[113.11,23.05],
            "海口":[110.35,20.02],
            "江门":[113.06,22.61],
            "章丘":[117.53,36.72],
            "肇庆":[112.44,23.05],
            "大连":[121.62,38.92],
            "临汾":[111.5,36.08],
            "吴江":[120.63,31.16],
            "石嘴山":[106.39,39.04],
            "沈阳":[123.38,41.8],
            "苏州":[120.62,31.32],
            "茂名":[110.88,21.68],
            "嘉兴":[120.76,30.77],
            "长春":[125.35,43.88],
            "胶州":[120.03336,36.264622],
            "银川":[106.27,38.47],
            "张家港":[120.555821,31.875428],
            "三门峡":[111.19,34.76],
            "锦州":[121.15,41.13],
            "南昌":[115.89,28.68],
            "柳州":[109.4,24.33],
            "三亚":[109.511909,18.252847],
            "自贡":[104.778442,29.33903],
            "吉林":[126.57,43.87],
            "阳江":[111.95,21.85],
            "泸州":[105.39,28.91],
            "西宁":[101.74,36.56],
            "宜宾":[104.56,29.77],
            "呼和浩特":[111.65,40.82],
            "成都":[104.06,30.67],
            "大同":[113.3,40.12],
            "镇江":[119.44,32.2],
            "桂林":[110.28,25.29],
            "张家界":[110.479191,29.117096],
            "宜兴":[119.82,31.36],
            "北海":[109.12,21.49],
            "西安":[108.95,34.27],
            "金坛":[119.56,31.74],
            "东营":[118.49,37.46],
            "牡丹江":[129.58,44.6],
            "遵义":[106.9,27.7],
            "绍兴":[120.58,30.01],
            "扬州":[119.42,32.39],
            "常州":[119.95,31.79],
            "潍坊":[119.1,36.62],
            "重庆":[106.54,29.59],
            "台州":[121.420757,28.656386],
            "南京":[118.78,32.04],
            "滨州":[118.03,37.36],
            "贵阳":[106.71,26.57],
            "无锡":[120.29,31.59],
            "本溪":[123.73,41.3],
            "克拉玛依":[84.77,45.59],
            "渭南":[109.5,34.52],
            "马鞍山":[118.48,31.56],
            "宝鸡":[107.15,34.38],
            "焦作":[113.21,35.24],
            "句容":[119.16,31.95],
            "北京":[116.46,39.92],
            "徐州":[117.2,34.26],
            "衡水":[115.72,37.72],
            "包头":[110,40.58],
            "绵阳":[104.73,31.48],
            "乌鲁木齐":[87.68,43.77],
            "枣庄":[117.57,34.86],
            "杭州":[120.19,30.26],
            "淄博":[118.05,36.78],
            "鞍山":[122.85,41.12],
            "溧阳":[119.48,31.43],
            "库尔勒":[86.06,41.68],
            "安阳":[114.35,36.1],
            "开封":[114.35,34.79],
            "济南":[117,36.65],
            "德阳":[104.37,31.13],
            "温州":[120.65,28.01],
            "九江":[115.97,29.71],
            "邯郸":[114.47,36.6],
            "临安":[119.72,30.23],
            "兰州":[103.73,36.03],
            "沧州":[116.83,38.33],
            "临沂":[118.35,35.05],
            "南充":[106.110698,30.837793],
            "天津":[117.2,39.13],
            "富阳":[119.95,30.07],
            "泰安":[117.13,36.18],
            "诸暨":[120.23,29.71],
            "郑州":[113.65,34.76],
            "哈尔滨":[126.63,45.75],
            "聊城":[115.97,36.45],
            "芜湖":[118.38,31.33],
            "唐山":[118.02,39.63],
            "平顶山":[113.29,33.75],
            "邢台":[114.48,37.05],
            "德州":[116.29,37.45],
            "济宁":[116.59,35.38],
            "荆州":[112.239741,30.335165],
            "宜昌":[111.3,30.7],
            "义乌":[120.06,29.32],
            "丽水":[119.92,28.45],
            "洛阳":[112.44,34.7],
            "秦皇岛":[119.57,39.95],
            "株洲":[113.16,27.83],
            "石家庄":[114.48,38.03],
            "莱芜":[117.67,36.19],
            "常德":[111.69,29.05],
            "保定":[115.48,38.85],
            "湘潭":[112.91,27.87],
            "金华":[119.64,29.12],
            "岳阳":[113.09,29.37],
            "长沙":[113,28.21],
            "衢州":[118.88,28.97],
            "廊坊":[116.7,39.53],
            "菏泽":[115.480656,35.23375],
            "合肥":[117.27,31.86],
            "武汉":[114.31,30.52],
            "大庆":[125.03,46.58]
        };
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push(geoCoord.concat(data[i].value));
                }
            }
            return res;
        };
        var option = {
            // backgroundColor: '#404a59',
            visualMap: {
                min: 0,
                max: 500,
                splitNumber: 5,
                inRange: {
                    color: ['#d94e5d','#eac736','#50a3ba'].reverse()
                },
                textStyle: {
                    color: '#333'
                }
            },
            geo: {
                map: 'china',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                roam: true,
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [{
                name: 'AQI',
                type: 'heatmap',
                coordinateSystem: 'geo',
                data: convertData(data)
            }]
        };
        chinaAqiChart.setOption(option);
    }
    // 城市列表
    function _renderAqiCity(cityData) {
        var html  = '';
        cityData.forEach(function (value) {
            if (value === city) {
                html += '<li class="active">'+value+'</li>'
            }
            html += '<li>'+value+'</li>'
        })
        jqMap.$cityList.append(html)
    }
    // 暴露给外部的接口，参数是改变的城市，功能与renderAqi类似，不同是城市列表和热力图没必要重新渲染
    function changeCityRender(changeCity) {
        city = changeCity;
        var cityAqiTitle,
            cityAqiData,
            cityAqiDetailData;
        jqMap.$defaultCity.text(changeCity)

        aqiRanking.forEach(function (value) {
            if (value.area === city) {
                var time = value.time_point.substring(value.time_point.indexOf('T') + 1,value.time_point.indexOf('Z'))
                cityAqiTitle = value.area + '全城平均\n' + time
                cityAqiData = {
                    name : value.quality,
                    value : value.aqi
                }
                cityAqiDetailData = [
                    {
                        name: "pm10",
                        value: value.pm10
                    }, {
                        name: "pm2_5",
                        value: value.pm2_5
                    }, {
                        name: "no2",
                        value: value.no2
                    }, {
                        name: "so2",
                        value: value.so2
                    }, {
                        name: "o3",
                        value: value.o3
                    }, {
                        name: "co",
                        value: value.co
                    }
                ]
            }
        })
        _renderCityAqi(cityAqiTitle, cityAqiData)
        _renderCityAqiDetail(cityAqiDetailData)
        _renderWeatheraAqi(cityAqiData)

        _renderWeatherDetail(weatherDetail)
        readerWeather24Hours(weather24Hours)
        _renderWeatherWeek(weatherWeek)
    }
    // 封装ajax方法
    function _ajax(url, cb) {
        // $.getJSON(url + '&callback=?')
        $.getJSON(url)
            .done(function(d) {
                // console.log(d)
                cb && cb(d)
            })
            .fail(function() {
                alert(url + '：获取不到数据');
            })
    }
    // 初始化方法
    function init(initCity) {
        city = initCity || '北京'
        jqMap.$defaultCity.text(initCity)
        render()
    }
    return {
        init: init,
        render : render,
        changeCityRender:changeCityRender
    }
})()
